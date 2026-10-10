import * as React from "react";
export interface KeyValueListProps {
  /** snake_case keys, plain values (strings or a Tag) */
  rows: { k: string; v: React.ReactNode }[];
}
export declare function KeyValueList(props: KeyValueListProps): JSX.Element;
