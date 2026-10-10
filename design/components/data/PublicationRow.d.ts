export interface PublicationRowProps {
  year: number | string;
  title: string;
  venue: string;
  /** "journal" | "preprint" etc. */
  type?: string;
  /** Link to the original publication — required for credit */
  href: string;
}
export declare function PublicationRow(props: PublicationRowProps): JSX.Element;
