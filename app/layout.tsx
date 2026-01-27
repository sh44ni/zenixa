import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Zenixa - Your Trusted E-commerce Store",
    template: "%s | Zenixa",
  },
  description: "Shop quality products at competitive prices. Zenixa offers electronics, clothing, home goods, and more with secure payment options.",
  keywords: ["ecommerce", "online shopping", "pakistan", "electronics", "clothing", "home goods"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zenixa",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Zenixa",
    title: "Zenixa - Your Trusted E-commerce Store",
    description: "Shop quality products at competitive prices.",
    images: ["/logo.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zenixa - Your Trusted E-commerce Store",
    description: "Shop quality products at competitive prices.",
    images: ["/logo.svg"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}


