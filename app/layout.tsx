import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Kit 10 Cuecas Boxer Masculinas de Microfibra Conforto • Loja Oficial",
  description:
    "Kit com 10 Cuecas Boxer de Microfibra Premium com tecnologia Dry respirável, cós elástico anatômico que não enrola e forro 100% algodão. De R$ 249,90 por R$ 159,90 com Frete Grátis!",
  keywords: [
    "kit 10 cuecas boxer",
    "cueca boxer microfibra",
    "cueca boxer masculina",
    "cueca que nao enrola",
    "cueca anti assadura",
    "cuecas dry fit",
    "kit cuecas atacado",
  ],
  openGraph: {
    title: "Kit 10 Cuecas Boxer Masculinas de Microfibra Conforto",
    description:
      "Apenas R$ 15,99 por peça. Cores lisas sortidas, tecido respirável que não sobe nas pernas e garantia total de 30 dias.",
    type: "website",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1000,
        height: 1000,
        alt: "Kit 10 Cuecas Boxer Masculinas de Microfibra Conforto",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-neutral-100">{children}</body>
    </html>
  );
}
