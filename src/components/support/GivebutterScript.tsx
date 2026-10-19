import Script from "next/script";
import { preconnect, preload } from "react-dom";
import { givebutterAccountId } from "@/lib/givebutter";

/** Loads the Givebutter widget runtime; rendered only on /support, where the form lives. */
export function GivebutterScript() {
  const accountId = givebutterAccountId();
  const src = `https://widgets.givebutter.com/latest.umd.cjs?acct=${encodeURIComponent(accountId)}&p=other`;

  // The form is a chain (runtime → form config → checkout iframe), so open
  // both origins and fetch the runtime while the page itself is still loading.
  preconnect("https://widgets.givebutter.com");
  preconnect("https://givebutter.com");
  preload(src, { as: "script" });

  return <Script src={src} strategy="afterInteractive" />;
}
