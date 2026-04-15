
import "@/styles/globals.css";
import type { ReactNode } from "react";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: "Fitness App",
  description: "Mediciones, rutinas, dieta y progreso"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
