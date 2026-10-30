import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workledger · Hours & Earnings",
  description: "Your work, at a glance. Track daily hours, qualifying time, and hourly rates with saved work history.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
