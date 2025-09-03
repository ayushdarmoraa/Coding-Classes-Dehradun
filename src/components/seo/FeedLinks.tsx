"use client";
import Head from "next/head";

export default function FeedLinks() {
  return (
    <Head>
      <link
        rel="alternate"
        type="application/rss+xml"
        href="/blog/rss"
        title="Doon Coding Academy Blog (RSS)"
      />
      <link
        rel="alternate"
        type="application/atom+xml"
        href="/blog/atom"
        title="Doon Coding Academy Blog (Atom)"
      />
    </Head>
  );
}
