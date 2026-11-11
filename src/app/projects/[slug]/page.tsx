import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/projects/ProjectDetail";
import {
  getProjectForEnvironment,
  getProjectsForEnvironment,
} from "@/lib/projects";
import { SITE } from "@/lib/site-config";

type Props = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectsForEnvironment().map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProjectForEnvironment(params.slug);
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
    robots:
      process.env.NODE_ENV === "development"
        ? { index: false, follow: false }
        : { index: true, follow: true },
  };
}

export default function ProjectPage({ params }: Props) {
  const project = getProjectForEnvironment(params.slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
