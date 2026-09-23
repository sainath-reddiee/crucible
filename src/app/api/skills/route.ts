import { NextRequest, NextResponse } from "next/server";
import { store } from "@/server/engine";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").toLowerCase();
  const stack = (req.nextUrl.searchParams.get("stack") || "").toLowerCase();
  let skills = store.skills;
  if (q) {
    skills = skills.filter((s) =>
      `${s.name} ${s.slug} ${s.techStack.join(" ")} ${s.archetype}`.toLowerCase().includes(q)
    );
  }
  if (stack && stack !== "all") {
    skills = skills.filter(
      (s) =>
        s.techStack.some((t) => t.toLowerCase() === stack) ||
        s.archetype.toLowerCase().includes(stack)
    );
  }
  return NextResponse.json({ skills });
}
