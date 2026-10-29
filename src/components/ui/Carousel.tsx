"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
}

export default function Carousel({
  children,
  className = "",
  ariaLabel,
}: CarouselProps) {
  const reduceMotion = useReducedMotion();
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: false,
    duration: reduceMotion ? 0 : 25,
    loop: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setSnapCount(emblaApi.scrollSnapList().length);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      emblaApi?.scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      emblaApi?.scrollNext();
    }
  };

  return (
    <div
      className={className}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="cf-viewport overflow-hidden" ref={viewportRef}>
        <div className="flex touch-pan-y">{children}</div>
      </div>
      {snapCount > 1 && (
        <div className="relative z-10 mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-full border border-blue-100 p-2 text-brand-dark hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Previous slide"
            onClick={() => emblaApi?.scrollPrev()}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
            {Array.from({ length: snapCount }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`h-2.5 w-2.5 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${selectedIndex === index ? "scale-x-[2.4] bg-brand" : "bg-blue-100"}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={selectedIndex === index ? "true" : undefined}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="rounded-full border border-blue-100 p-2 text-brand-dark hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Next slide"
            onClick={() => emblaApi?.scrollNext()}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
