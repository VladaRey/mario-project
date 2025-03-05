import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import "~/styles/globals.css";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Reservation App",
  description: "Manage players and reservations",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
