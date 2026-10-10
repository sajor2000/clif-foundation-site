import * as React from "react";
export interface TextLinkProps {
  href: string;
  /** Adds ↗ and a visually hidden "opens external site" label */
  external?: boolean;
  /** signal-400 on ink grounds */
  inverse?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function TextLink(props: TextLinkProps): JSX.Element;
