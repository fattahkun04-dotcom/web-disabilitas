import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SahabatABK - Paguyuban Keluarga Anak Berkebutuhan Khusus",
  description:
    "Platform digital terpadu untuk Paguyuban Keluarga Anak Berkebutuhan Khusus. Bersama lebih kuat, tumbuh lebih jauh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
