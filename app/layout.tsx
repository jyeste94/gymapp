import "@/styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Fitness App",
  description: "Mediciones, rutinas, dieta y progreso"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
