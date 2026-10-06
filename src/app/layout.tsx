import "~/styles/globals.css";
import { Manrope } from "next/font/google";
import { type Metadata } from "next";
import { MockDbBanner } from "~/components/mock-db-banner";

const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Player Reservation App",
  description: "Manage players and reservations",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        {children}
        {process.env.NEXT_PUBLIC_USE_MOCK_DB === "1" && <MockDbBanner />}
      </body>
    </html>
  );
}
