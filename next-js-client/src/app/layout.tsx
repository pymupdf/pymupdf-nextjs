import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuPDF Next App",
  description: "A sample NextJS app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body id="root">{children}</body>
    </html>
  );
}
