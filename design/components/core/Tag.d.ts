export interface TagProps {
  /** proposed = signal fill (Foundation plans); existing = ink fill (approved/Consortium facts); neutral = metadata like "journal" */
  status?: "proposed" | "existing" | "neutral";
  children?: string;
}
export declare function Tag(props: TagProps): JSX.Element;
