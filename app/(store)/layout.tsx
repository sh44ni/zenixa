import { Outfit, Space_Grotesk } from "next/font/google"
import "@/app/store.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { DemoPopup } from "@/components/store/demo-popup"
import { prisma } from "@/lib/prisma"

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

interface SocialLink {
  platform: string
  url: string
  label?: string
}

async function getFooterSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      where: { id: "default" },
      select: {
        footerBrandText: true,
        footerEmail: true,
        footerPhone: true,
        footerAddress: true,
        footerSocialLinks: true,
      }
    })
    return settings
  } catch {
    return null
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const footerSettings = await getFooterSettings()

  return (
    <div className={`flex min-h-screen flex-col store-theme ${outfit.variable} ${space.variable} font-sans`}>
      <Header />
      <main className="flex-1 pt-16 md:pt-20" id="main-content">
        {children}
      </main>
      <Footer
        brandText={footerSettings?.footerBrandText}
        email={footerSettings?.footerEmail}
        phone={footerSettings?.footerPhone}
        address={footerSettings?.footerAddress}
        socialLinks={footerSettings?.footerSocialLinks as SocialLink[] | undefined}
      />
      <BottomNavigation />
      <DemoPopup />
    </div>
  )
}
