import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const spaceGroteskHeading = Space_Grotesk({subsets:['latin'],variable:'--font-heading'});

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({subsets:['latin'],variable:'--font-mono'})

export const metadata: Metadata = {
  title: "Ingestalt Spatial IDE",
  description: "Local-first spatial graph documentation engine for software architecture",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ingestalt",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, "font-mono", geistMono.variable, spaceGroteskHeading.variable)}
    >
      <head>
        <link rel="manifest" href="/ingestalt/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/ingestalt/sw.js').then(
                    function(registration) {
                      console.log('Ingestalt PWA ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Ingestalt PWA ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
