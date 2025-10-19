import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
