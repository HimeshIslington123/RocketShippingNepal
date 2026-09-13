import type { Metadata } from "next";
import { Google_Sans_Flex, Inter } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";

const googleSans = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Rocket Shipping | Cargo & Logistics Nepal",
  description:
    "Rocket Shipping provides reliable cargo, courier, door-to-door delivery, bulk transport and international shipping services across Nepal.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${googleSans.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-screen bg-white font-body text-[#0b1729]">
        {children}

        {/* Floating WhatsApp */}
        <WhatsAppButton />
      </body>
    </html>
  );
}