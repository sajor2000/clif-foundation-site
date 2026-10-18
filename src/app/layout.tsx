import type { Metadata } from "next";
import { funnelDisplay, funnelSans, splineMono } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site";
import { ORGANIZATION_JSON_LD, SITE_NAME, jsonLdScript } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CLIF Foundation",
    template: "%s · CLIF Foundation",
  },
  description:
    "An Illinois nonprofit scaling adoption of the Common Longitudinal ICU data Format beyond observational research. 501(c)(3) application pending.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
  },
  twitter: { card: "summary_large_image" },
};

const themeBoot = `(function(){function syncToggle(){var dark=document.documentElement.dataset.theme==='dark';document.querySelectorAll('.clif-theme-toggle').forEach(function(el){el.checked=dark;});}try{var t=localStorage.getItem('clif-site-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.dataset.theme='dark';}}catch(e){}document.addEventListener('change',function(e){var el=e.target;if(!el||!el.classList||!el.classList.contains('clif-theme-toggle'))return;var dark=!!el.checked;document.documentElement.dataset.theme=dark?'dark':'light';syncToggle();try{localStorage.setItem('clif-site-theme',dark?'dark':'light');}catch(err){}});if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',syncToggle);}else{syncToggle();}})();`

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${funnelDisplay.variable} ${funnelSans.variable} ${splineMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="min-h-full antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(ORGANIZATION_JSON_LD) }}
        />
        {children}
      </body>
    </html>
  );
}
