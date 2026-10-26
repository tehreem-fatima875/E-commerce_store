import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const result = newsletterSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Newsletter sign-up is not configured; your email was not saved." },
    { status: 503 },
  );
}
