import {
  Funnel_Display,
  Funnel_Sans,
  Spline_Sans_Mono,
} from "next/font/google";

export const funnelDisplay = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  variable: "--font-sans-face",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
  weight: ["400", "500"],
});
