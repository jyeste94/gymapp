import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { BottomNav } from "@/components/bottom-nav"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "FitTracker - Seguimiento de Entrenamiento",
  description: "App completa para seguimiento de entrenamiento de fuerza y running",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col pb-16">
            <main className="flex-1 pb-4">{children}</main>
            <BottomNav />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
