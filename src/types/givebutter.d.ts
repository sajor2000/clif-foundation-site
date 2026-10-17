import type { DetailedHTMLProps, HTMLAttributes } from "react";

type GivebutterGivingFormProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    campaign?: string;
    "max-width"?: string;
  },
  HTMLElement
>;

type GivebutterWidgetProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & { id: string },
  HTMLElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "givebutter-giving-form": GivebutterGivingFormProps;
      "givebutter-widget": GivebutterWidgetProps;
    }
  }
}

export {};
