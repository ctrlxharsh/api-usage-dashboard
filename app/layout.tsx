import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenAI Usage Dashboard",
  description:
    "Monitor your OpenAI API spending, token consumption, and usage patterns with beautiful visualizations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#0a0a14", colorScheme: "dark" }}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: "#0a0a14", color: "#e2e8f0" }}>{children}</body>
    </html>
  );
}
