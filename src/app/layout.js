import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/Toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "H-Mate - Your Digital Mentor",
  description:
    "Temukan karier impianmu dengan bantuan AI. Platform edukasi untuk Indonesia Emas 2045.",
  keywords: [
    "karier",
    "ai",
    "edukasi",
    "bimbingan",
    "tes minat bakat",
    "indonesia",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="{inter.className} bg-slate-900">
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
