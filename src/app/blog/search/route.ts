import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET(req: Request) {
  const incoming = new URL(req.url);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const redirectTo = new URL(`${base}/blog/search.json`);
  // Preserve query params
  incoming.searchParams.forEach((v, k) => redirectTo.searchParams.set(k, v));
  return NextResponse.redirect(redirectTo.toString(), { status: 308 });
}
