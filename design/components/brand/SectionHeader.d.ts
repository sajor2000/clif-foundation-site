import * as React from "react";
export interface SectionHeaderProps {
  /** "02" — rendered in mono before the label */
  index?: string;
  /** "Our work" on home sections; "our_work" on page heads */
  label?: string;
  title: React.ReactNode;
  lead?: string;
  /** Right-aligned link or button */
  action?: React.ReactNode;
  level?: 1 | 2 | 3;
  /** page = display-l with ruled lead; section = h2 */
  size?: "page" | "section";
  inverse?: boolean;
}
export declare function SectionHeader(props: SectionHeaderProps): JSX.Element;
