/**
 * @startingPoint section="Brand" subtitle="CLIF symbol + rule + Foundation" viewport="700x160"
 */
export interface LockupProps {
  /** ink = one-color ink logo (default, light grounds); inverse = white logo on ink; consortium = original crimson, ONLY where the Consortium is credited */
  tone?: "ink" | "inverse" | "consortium";
  /** Logo height in px; min 24 */
  height?: number;
  /** Text after the rule; pass "" for symbol only */
  label?: string;
  href?: string;
  onClick?: (e: any) => void;
}
export declare function Lockup(props: LockupProps): JSX.Element;
