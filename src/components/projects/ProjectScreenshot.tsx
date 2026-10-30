import { existsSync } from "node:fs";
import Image from "next/image";
import { resolveProjectScreenshotPath } from "@/lib/projects";

type Props = {
  alt: string;
  projectSlug: string;
  src?: string;
  className?: string;
};

export default function ProjectScreenshot({
  alt,
  projectSlug,
  src,
  className = "",
}: Props) {
  const resolvedPath = src
    ? resolveProjectScreenshotPath(projectSlug, src)
    : undefined;
  if (!src || !resolvedPath || !existsSync(resolvedPath)) {
    return (
      <div
        className={`relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-blue-50 p-4 text-left shadow-inner ${className}`}
        role="img"
        aria-label={`Screenshot pending: ${alt}`}
      >
        <div aria-hidden="true" className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-slate-300" />
          <span className="size-2 rounded-full bg-slate-300" />
          <span className="size-2 rounded-full bg-slate-300" />
          <span className="ml-2 h-2 w-24 rounded-full bg-slate-200" />
        </div>
        <div aria-hidden="true" className="grid grid-cols-[1fr_2fr] gap-3">
          <span className="h-12 rounded-lg bg-blue-100/80" />
          <span className="space-y-2">
            <span className="block h-3 w-4/5 rounded-full bg-slate-200" />
            <span className="block h-3 w-full rounded-full bg-slate-100" />
            <span className="block h-3 w-2/3 rounded-full bg-slate-100" />
          </span>
        </div>
        <span className="text-xs font-semibold tracking-wide text-slate-600">
          SCREENSHOT TO BE ADDED
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={1280}
      height={720}
      className={`aspect-video w-full rounded-xl object-cover ${className}`}
    />
  );
}
