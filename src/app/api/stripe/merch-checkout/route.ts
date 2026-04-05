import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = (await request.json()) as { items: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Verify products exist and prices match
    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock, active, stripe_price_id")
      .in("id", productIds)
      .eq("active", true);

    if (productsError || !products) {
      return NextResponse.json(
        { error: "Failed to verify products" },
        { status: 500 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    const verifiedItems: Array<{
      productId: string;
      productName: string;
      price: number;
      quantity: number;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productName}` },
          { status: 400 }
        );
      }
      if (product.price !== item.price) {
        return NextResponse.json(
          { error: `Price mismatch for ${product.name}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const stripe = getStripe();

    const lineItems = verifiedItems.map((item) => {
      const product = productMap.get(item.productId)!;
      if (product.stripe_price_id) {
        return {
          price: product.stripe_price_id,
          quantity: item.quantity,
        };
      }
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productName,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      metadata: {
        user_id: user.id,
        order_items: JSON.stringify(verifiedItems),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/store/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Merch checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
