import type { Metadata } from "next";
import { Big_Shoulders, Inter,Google_Sans_Flex } from "next/font/google";
import "./globals.css";



const bigShoulders = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Rocket Shipping",
  description:
    "",
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
      className={`${bigShoulders.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0b0c] text-white font-body">
        {children}
      </body>
    </html>
  );
}
