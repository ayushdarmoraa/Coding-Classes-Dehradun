import { NextResponse } from "next/server";
import { SITE } from "@/lib/site-config";

export const dynamic = "force-static";

export async function GET(req: Request) {
  const incoming = new URL(req.url);
  const base = SITE.url;
  const redirectTo = new URL(`${base}/blog/search.json`);
  // Preserve query params
  incoming.searchParams.forEach((v, k) => redirectTo.searchParams.set(k, v));
  return NextResponse.redirect(redirectTo.toString(), { status: 308 });
}
