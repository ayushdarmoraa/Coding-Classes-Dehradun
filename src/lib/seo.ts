export type Crumb = { name: string; url: string };

// Helper to build BreadcrumbList JSON-LD from an ordered list of crumbs
// Always includes BOTH top-level `name` and nested `item.name` for each ListItem
export function breadcrumbLd(items: Crumb[]) {
  // Normalize defensively to avoid undefined/empty names
  const normalized = items.map((it) => {
    const name = (it?.name || "").toString().trim();
    const url = (it?.url || "").toString().trim();
    return {
      name: name || url || "Breadcrumb",
      url,
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: normalized.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      // 1) top-level name
      name: item.name,
      // 2) nested item object with @id and name
      item: {
        "@type": "WebPage",
        "@id": item.url,
        name: item.name,
      },
    })),
  } as const;
}
