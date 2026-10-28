import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/projects/ProjectDetail";
import {
  getPublishedProjectBySlug,
  getPublishedProjects,
} from "@/lib/projects";
import { SITE } from "@/lib/site-config";

type Props = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedProjects().map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getPublishedProjectBySlug(params.slug);
  if (!project) {
    return {
      title: "Project Not Found | Doon Coding Academy",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `${SITE.url}/projects/${project.slug}`;
  return {
    title: project.seo.title,
    description: project.seo.description,
    alternates: { canonical },
    openGraph: {
      title: project.seo.title,
      description: project.seo.description,
      url: canonical,
      type: "article",
      siteName: SITE.name,
    },
    robots: { index: true, follow: true },
  };
}

export default function ProjectPage({ params }: Props) {
  const project = getPublishedProjectBySlug(params.slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
