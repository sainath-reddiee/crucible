import { NextResponse } from "next/server";
import { store } from "@/server/engine";

export async function GET() {
  return NextResponse.json({ events: store.events });
}
