import * as React from "react";
/**
 * @startingPoint section="Data" subtitle="Framed figure with mono header — the brand's core motif" viewport="700x260"
 */
export interface DataPanelProps {
  /** Mono header, often a CLIF table or field name, e.g. "respiratory_support.device_category" */
  title?: string;
  /** Right side of header, e.g. "Illustrative schematic · not patient data" */
  meta?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  inverse?: boolean;
  style?: React.CSSProperties;
}
export declare function DataPanel(props: DataPanelProps): JSX.Element;
