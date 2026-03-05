import type { Metadata } from "next";
import "./globals.css";
import "@campstudio/camp-ui-kit/styles.css";
import { PresentationProvider } from "@/app/context/PresentationContext";

export const metadata: Metadata = {
  title: "Кэмп — Создай презентацию с ИИ",
  description:
    "Создавай презентации с ИИ — от идеи до финального слайда. Настрой дизайн, стиль и структуру — ИИ сделает остальное.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PresentationProvider>{children}</PresentationProvider>
      </body>
    </html>
  );
}
