import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "บริษัท ซีวิล คอนเนค จำกัด | Civil Connek - รับเหมาก่อสร้างและวิศวกรรมครบวงจร",
  description: "บริการออกแบบและรับเหมาก่อสร้างครบวงจร คำนวณโครงสร้างสถาปัตยกรรม โดยทีมวิศวกรมืออาชีพ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="scroll-smooth">
      <body className={`${kanit.variable} font-sans antialiased bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
