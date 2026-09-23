import { NextResponse } from "next/server";
import { store } from "@/server/engine";

export async function POST() {
  return NextResponse.json(store.pipeline());
}
