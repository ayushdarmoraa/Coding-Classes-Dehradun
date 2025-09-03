"use client";
import Head from "next/head";

export default function PrevNextLinks({ prev, next }: { prev?: string; next?: string }) {
  if (!prev && !next) return null;
  return (
    <Head>
      {prev ? <link rel="prev" href={prev} /> : null}
      {next ? <link rel="next" href={next} /> : null}
    </Head>
  );
}
