import { Outfit, Space_Grotesk } from "next/font/google"
import "@/app/store.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BottomNavigation } from "@/components/layout/bottom-navigation"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
})

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`flex min-h-screen flex-col store-theme ${outfit.variable} ${space.variable} font-sans`}>
      <Header />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  )
}

