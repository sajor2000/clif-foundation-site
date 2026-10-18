import Script from "next/script";
import { givebutterAccountId } from "@/lib/givebutter";

/** Loads Givebutter widgets on every page (required by Givebutter embed docs). */
export function GivebutterScript() {
  const accountId = givebutterAccountId();

  return (
    <Script
      src={`https://widgets.givebutter.com/latest.umd.cjs?acct=${encodeURIComponent(accountId)}&p=other`}
      strategy="afterInteractive"
    />
  );
}
