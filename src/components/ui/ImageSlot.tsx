import Image from "next/image";

interface ImageSlotProps {
  alt?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  src?: string;
  kenBurns?: boolean;
}

export default function ImageSlot({
  alt = "",
  className = "",
  imageClassName = "",
  priority = false,
  sizes = "(min-width: 1024px) 560px, 100vw",
  src,
  kenBurns = false,
}: ImageSlotProps) {
  return (
    <div
      className={`group relative isolate aspect-[4/3] overflow-hidden rounded-dca-md bg-navy-grad ${className}`}
      role={!src && alt ? "img" : undefined}
      aria-label={!src && alt ? alt : undefined}
      aria-hidden={!src && !alt ? true : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transform-none ${
            kenBurns ? "ken-burns" : ""
          } ${imageClassName}`}
        />
      ) : (
        <svg
          className="absolute inset-0 h-full w-full text-white/20 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transform-none"
          viewBox="0 0 640 480"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <circle cx="488" cy="128" r="118" fill="currentColor" />
          <circle cx="488" cy="128" r="76" stroke="white" strokeOpacity=".36" strokeWidth="2" />
          <path d="M0 400 190 210l150 148 104-104 196 196v30H0v-80Z" fill="white" fillOpacity=".1" />
          <path d="M0 425 190 235l150 148 104-104 196 196" stroke="white" strokeOpacity=".42" strokeWidth="2" />
          <rect x="70" y="72" width="172" height="132" rx="18" stroke="white" strokeOpacity=".36" strokeWidth="2" />
          <path d="m110 117 18 18-18 18m37 0h34" stroke="white" strokeOpacity=".75" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a1a38]/65 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
