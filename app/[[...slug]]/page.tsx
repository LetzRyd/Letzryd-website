import type { Metadata } from "next";
import { notFound } from "next/navigation";
import pages from "../../src/generated/pages.json";
import routes from "../../src/generated/routes.json";
import { ReplicaPageWithRuntime } from "../../src/components/ReplicaPage";

type PageRecord = {
  slug: string;
  title: string;
  html: string;
};

type Params = {
  slug?: string[];
};

const pageMap = pages as Record<string, PageRecord>;
const routeList = routes as string[];

function keyFromParams(params: Params) {
  const slug = params.slug?.join("/") ?? "";
  return slug || "home";
}

export function generateStaticParams() {
  return routeList.map((slug) => ({
    slug: slug ? slug.split("/") : undefined,
  }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const page = pageMap[keyFromParams(params)];
  if (!page) return {};

  const path = page.slug ? `/${page.slug}` : "/";
  return {
    title: page.title,
    alternates: { canonical: path },
    openGraph: {
      title: page.title,
      url: path,
      siteName: "LetzRyd",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
    },
  };
}

export default function Page({ params }: { params: Params }) {
  const page = pageMap[keyFromParams(params)];
  if (!page) notFound();

  return <ReplicaPageWithRuntime html={page.html} />;
}
