import { NextResponse } from "next/server";
import { store } from "@/server/engine";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  return NextResponse.json(store.run(body.slug, body.engineerId || "eng-karthik"));
}
