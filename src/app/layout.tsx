import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "NeighborIQ — AI-Powered Civic Intelligence",
  description:
    "Real neighborhood intelligence for Montgomery, AL. Crime data, building permits, flood zones, news sentiment, and AI-powered insights — all in one platform.",
  keywords: [
    "Montgomery",
    "Alabama",
    "neighborhood",
    "civic",
    "crime data",
    "AI",
    "city intelligence",
  ],
};

// Inline script to set theme before paint (prevents flash)
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('neighboriq-theme');
      if (t === 'light') document.documentElement.className = 'light';
      else document.documentElement.className = 'dark';
    } catch(e) {
      document.documentElement.className = 'dark';
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
