import type { Metadata } from "next";
import { ThemeProvider, themeBootScript } from "@/components/theme-provider";
import { LayoutModeProvider } from "@/components/layout-mode";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vellum — LLM documentation workspace",
  description:
    "Generate, analyze, and review documentation with an LLM. Frontend demo with mock data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="slate" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeProvider>
          <LayoutModeProvider>{children}</LayoutModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
