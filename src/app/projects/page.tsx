import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectsIndex from "@/components/projects/ProjectsIndex";
import { getProjectsForEnvironment } from "@/lib/projects";
import { SITE } from "@/lib/site-config";

type Props = {
  searchParams?: { tag?: string | string[] };
};

export const metadata: Metadata = {
  title: "Projects | Doon Coding Academy",
  description:
    "Explore verified coding projects from Doon Coding Academy. See each project's purpose, features, technologies, and learning links, then explore a course.",
  alternates: { canonical: `${SITE.url}/projects` },
  openGraph: {
    title: "Projects | Doon Coding Academy",
    description:
      "Explore verified coding projects from Doon Coding Academy. See each project's purpose, features, technologies, and learning links, then explore a course.",
    url: `${SITE.url}/projects`,
    type: "website",
    siteName: SITE.name,
  },
  robots:
    process.env.NODE_ENV === "development"
      ? { index: false, follow: false }
      : undefined,
};

export default function ProjectsPage({ searchParams }: Props) {
  const projects = getProjectsForEnvironment();
  if (projects.length === 0) notFound();

  const selectedTag =
    typeof searchParams?.tag === "string" ? searchParams.tag : undefined;

  return (
    <ProjectsIndex
      projects={projects}
      selectedTag={selectedTag}
    />
  );
}
