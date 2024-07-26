import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const inter = Josefin_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Traditional Card Games",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
