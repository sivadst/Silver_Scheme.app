import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silver Savings Scheme",
  description: "A modern jewelry/silver savings tracking application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}