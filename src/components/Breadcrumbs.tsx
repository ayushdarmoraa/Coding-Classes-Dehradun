import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-4 text-sm text-ink-2" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <Link href={item.href} className="font-medium text-brand-dark hover:underline">
              {item.label}
            </Link>
            {index < items.length - 1 && (
              <span className="mx-2 text-gray-500">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

