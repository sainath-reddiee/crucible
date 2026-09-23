import { NextResponse } from "next/server";
import { CONTEXTS, store } from "@/server/engine";
import type { WorkContext } from "@/lib/data";

export async function POST(req: Request) {
  const body = await req.json();
  const engineerId = body.engineerId || "eng-karthik";
  if (body.quiet === true || body.quiet === false) {
    store.setQuiet(engineerId, body.quiet);
    return NextResponse.json({ quiet: body.quiet });
  }
  if (body.dismiss) {
    store.dismiss(engineerId, body.dismiss);
    return NextResponse.json({ dismissed: body.dismiss });
  }
  let ctx: WorkContext | undefined = body.context;
  if (!ctx && body.contextId) ctx = CONTEXTS.find((c) => c.id === body.contextId);
  if (!ctx) return NextResponse.json({ error: "context required" }, { status: 400 });
  return NextResponse.json(store.suggest(ctx, engineerId));
}

export async function GET() {
  return NextResponse.json({ contexts: CONTEXTS });
}
