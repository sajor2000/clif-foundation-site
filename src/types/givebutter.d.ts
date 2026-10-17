import type { DetailedHTMLProps, HTMLAttributes } from "react";

type GivebutterGivingFormProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    campaign?: string;
    "max-width"?: string;
  },
  HTMLElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "givebutter-giving-form": GivebutterGivingFormProps;
    }
  }
}

export {};
