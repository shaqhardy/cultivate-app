import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, name } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;

  if (!apiKey || !formId) {
    return NextResponse.json({ error: "Kit not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          email,
          first_name: name?.split(" ")[0] || "",
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ subscriber_id: data.subscription?.subscriber?.id });
  } catch {
    return NextResponse.json(
      { error: "Kit API error" },
      { status: 500 }
    );
  }
}
