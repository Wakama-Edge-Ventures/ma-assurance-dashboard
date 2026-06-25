import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "leaflet/dist/leaflet.css";

import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const plexSans = Plus_Jakarta_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Plus_Jakarta_Sans({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Wakama Assurance Dashboard",
  description:
    "Dashboard B2B Wakama pour l'orchestration technique assurance agricole.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${plexSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
