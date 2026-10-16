import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { funnelDisplay, funnelSans, splineMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CLIF Foundation",
    template: "%s · CLIF Foundation",
  },
  description:
    "An Illinois nonprofit scaling adoption of the Common Longitudinal ICU data Format beyond observational research. 501(c)(3) recognition is in preparation.",
};

const themeBoot = `(function(){function syncToggle(){var el=document.getElementById('clif-theme-toggle');if(el)el.checked=document.documentElement.dataset.theme==='dark';}try{var t=localStorage.getItem('clif-site-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.dataset.theme='dark';}}catch(e){}document.addEventListener('change',function(e){var el=e.target;if(!el||el.id!=='clif-theme-toggle')return;var dark=!!el.checked;document.documentElement.dataset.theme=dark?'dark':'light';try{localStorage.setItem('clif-site-theme',dark?'dark':'light');}catch(err){}});if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',syncToggle);}else{syncToggle();}})();`

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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
