import Image from "next/image";

type Props = {
  alt: string;
  src?: string;
  className?: string;
};

export default function ProjectScreenshot({
  alt,
  src,
  className = "",
}: Props) {
  if (!src) {
    return (
      <div
        className={`flex aspect-video items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-sm text-gray-600 ${className}`}
        role="img"
        aria-label={`Screenshot pending: ${alt}`}
      >
        Screenshot pending
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
