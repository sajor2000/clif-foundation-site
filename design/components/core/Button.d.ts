import * as React from "react";
/**
 * @startingPoint section="Core" subtitle="Ink primary, outline secondary, ghost, inverse" viewport="700x200"
 */
export interface ButtonProps {
  /** primary = ink fill (one per view region); secondary = 1px ink outline; ghost = nav-weight; inverse = on ink grounds */
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  /** sm 36px (desktop only), md 44px, lg 48px (primary CTAs, mobile) */
  size?: "sm" | "md" | "lg";
  /** Renders an <a> when set */
  href?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
