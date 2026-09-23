import { NextResponse } from "next/server";
import { store } from "@/server/engine";

export async function GET() {
  return NextResponse.json({ reviews: store.reviews });
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = store.decide(body.slug, body.decision, body.actor || "Mishra");
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ review: item });
}
