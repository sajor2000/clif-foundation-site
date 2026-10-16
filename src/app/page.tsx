import type { Metadata } from "next";
import { HomeScroll } from "@/components/home/HomeScroll";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "CLIF Foundation · Open infrastructure for critical care data",
  description:
    "CLIF Foundation is an Illinois nonprofit supporting adoption of CLIF, the Common Longitudinal ICU data Format, an open data standard for critical care EHR data.",
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return <HomeScroll />;
}
