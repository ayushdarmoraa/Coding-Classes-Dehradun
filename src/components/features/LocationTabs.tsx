"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import ImageSlot from "@/components/ui/ImageSlot";

export interface LocationTile {
  name: string;
  badge: string;
  href: string;
  blurb: string;
  primaryHref: string;
  primaryText: string;
  secondaryHref: string;
  secondaryText: string;
}

export default function LocationTabs({ tiles }: { tiles: LocationTile[] }) {
  const [activeLocation, setActiveLocation] = useState(tiles[0]?.href ?? "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTile = tiles.find((tile) => tile.href === activeLocation) ?? tiles[0];

  if (!activeTile) return null;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tiles.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tiles.length) % tiles.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tiles.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      tabRefs.current[nextIndex]?.focus();
      setActiveLocation(tiles[nextIndex].href);
    }
  };

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)]">
      <div
        className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
        role="tablist"
        aria-labelledby="choose-path"
      >
        {tiles.map((tile, index) => (
          <button
            key={tile.href}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`location-tab-${tile.name.toLowerCase()}`}
            type="button"
            role="tab"
            aria-selected={activeTile.href === tile.href}
            aria-controls={`location-panel-${tile.name.toLowerCase()}`}
            tabIndex={activeTile.href === tile.href ? 0 : -1}
            onClick={() => setActiveLocation(tile.href)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={`shrink-0 rounded-full border px-5 py-3 text-left font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 lg:rounded-dca-sm ${
              activeTile.href === tile.href
                ? "border-brand bg-brand text-white"
                : "border-brand-soft bg-white text-ink-2 hover:bg-brand-soft"
            }`}
          >
            {tile.name}
          </button>
        ))}
      </div>
      <div
        id={`location-panel-${activeTile.name.toLowerCase()}`}
        role="tabpanel"
        aria-labelledby={`location-tab-${activeTile.name.toLowerCase()}`}
        tabIndex={0}
        className="grid items-stretch gap-5 rounded-dca-md border border-brand-soft bg-white p-4 shadow-soft-blue sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.65fr)]"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-ink">{activeTile.name}</h3>
            <span className="chip">{activeTile.badge}</span>
          </div>
          <div className="mt-4 text-ink-2">
            <p>{activeTile.blurb}</p>
            <p className="mt-3 text-sm">
              Start with{" "}
              <Link className="font-semibold text-brand-dark hover:underline" href="/courses/full-stack">
                Full-Stack
              </Link>{" "}
              or browse{" "}
              <Link className="font-semibold text-brand-dark hover:underline" href="/online-courses">
                Online Courses
              </Link>
              .
            </p>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            <Link
              href={activeTile.primaryHref}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {activeTile.primaryText}
            </Link>
            <Link
              href={activeTile.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Learn More
            </Link>
          </div>
          <Link
            href={activeTile.secondaryHref}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brand-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {activeTile.secondaryText}
          </Link>
        </div>
        <ImageSlot alt="" className="h-full min-h-48 md:min-h-0" />
      </div>
    </div>
  );
}
