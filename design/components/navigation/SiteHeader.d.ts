/**
 * @startingPoint section="Navigation" subtitle="Sticky header with lockup, five destinations, mobile menu" viewport="1280x140"
 */
export interface SiteHeaderProps {
  /** "home" | "mission" | "work" | "research" | "board" | "support" */
  current?: string;
  onNavigate?: (id: string) => void;
  items?: [string, string][];
  /** Container width below which the nav collapses to a Menu button */
  breakpoint?: number;
  /** Current theme; renders the Light/Dark toggle when onToggleTheme is provided */
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}
export declare function SiteHeader(props: SiteHeaderProps): JSX.Element;
