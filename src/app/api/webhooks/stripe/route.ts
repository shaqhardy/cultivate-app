import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

function getPeriodDates(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  return {
    start: item?.current_period_start
      ? new Date(item.current_period_start * 1000).toISOString()
      : null,
    end: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  };
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (!userId || session.mode !== "subscription") break;

      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      );
      const period = getPeriodDates(subscription);

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0]?.price.id,
        status: "active",
        current_period_start: period.start,
        current_period_end: period.end,
      }, { onConflict: "stripe_subscription_id" });

      await supabase
        .from("profiles")
        .update({ role: "paid_member" })
        .eq("id", userId);

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const status = subscription.cancel_at_period_end
        ? "canceled"
        : subscription.status === "active"
        ? "active"
        : subscription.status === "past_due"
        ? "past_due"
        : "inactive";

      const period = getPeriodDates(subscription);

      await supabase
        .from("subscriptions")
        .update({
          status,
          stripe_price_id: subscription.items.data[0]?.price.id,
          current_period_start: period.start,
          current_period_end: period.end,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (status !== "active") {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (sub) {
          await supabase
            .from("profiles")
            .update({ role: "free_member" })
            .eq("id", sub.user_id);
        }
      }

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscription.id);

      if (sub) {
        await supabase
          .from("profiles")
          .update({ role: "free_member" })
          .eq("id", sub.user_id);
      }

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId =
        invoice.parent?.type === "subscription_details"
          ? invoice.parent.subscription_details?.subscription
          : null;
      if (subId) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
