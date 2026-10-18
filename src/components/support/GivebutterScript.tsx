import Script from "next/script";
import { givebutterAccountId } from "@/lib/givebutter";

/** Loads the Givebutter widget runtime; rendered only on /support, where the form lives. */
export function GivebutterScript() {
  const accountId = givebutterAccountId();

  return (
    <Script
      src={`https://widgets.givebutter.com/latest.umd.cjs?acct=${encodeURIComponent(accountId)}&p=other`}
      strategy="afterInteractive"
    />
  );
}
