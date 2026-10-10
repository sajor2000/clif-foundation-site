export interface SiteFooterProps {
  links?: { label: string; href?: string; onClick?: (e: any) => void }[];
  email?: string;
  note?: string;
}
export declare function SiteFooter(props: SiteFooterProps): JSX.Element;
