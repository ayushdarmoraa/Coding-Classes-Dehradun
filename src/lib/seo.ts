export type Crumb = { name: string; url: string };

// Helper to build BreadcrumbList JSON-LD from an ordered list of crumbs
export function breadcrumbLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  } as const;
}
