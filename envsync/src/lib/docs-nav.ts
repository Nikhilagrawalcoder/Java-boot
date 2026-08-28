export interface DocsNavItem {
  href: string;
  label: string;
}

export interface DocsNavSection {
  title: string;
  items: DocsNavItem[];
}

export const DOCS_NAV: DocsNavSection[] = [
  {
    title: "Get started",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/quickstart", label: "Quickstart" },
    ],
  },
  {
    title: "Guides",
    items: [
      { href: "/docs/concepts", label: "Core concepts" },
      { href: "/docs/github-permissions", label: "GitHub permissions" },
    ],
  },
  {
    title: "Reference",
    items: [{ href: "/docs/faq", label: "FAQ" }],
  },
];

export const DOCS_FLAT_NAV: DocsNavItem[] = DOCS_NAV.flatMap((section) => section.items);

export function getDocsPager(currentHref: string): { prev?: DocsNavItem; next?: DocsNavItem } {
  const index = DOCS_FLAT_NAV.findIndex((item) => item.href === currentHref);
  if (index === -1) return {};
  return {
    prev: index > 0 ? DOCS_FLAT_NAV[index - 1] : undefined,
    next: index < DOCS_FLAT_NAV.length - 1 ? DOCS_FLAT_NAV[index + 1] : undefined,
  };
}
