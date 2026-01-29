import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { HeroSlider } from "./hero-slider"
import { prisma } from "@/lib/prisma"

// Default settings if database call fails
const defaultSettings = {
    heroMode: "image" as const,
    heroImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
    heroSliderImages: [] as string[],
    heroTitle: "Discover Quality Products at Amazing Prices",
    heroSubtitle: "Shop the latest trends in electronics, fashion, home essentials, and more. Enjoy secure payments and fast delivery across Pakistan.",

    heroShowText: true,
    heroShowBadge: true,
    heroBadgeText: "New Collection 2026",

    heroShowButton1: true,
    heroButton1Text: "Shop Now",
    heroButton1Link: "/products",

    heroShowButton2: true,
    heroButton2Text: "Explore Categories",
    heroButton2Link: "/categories",
}

async function getSiteSettings() {
    try {
        const settings = await prisma.siteSettings.findFirst({
            where: { id: "default" }
        })

        if (!settings) {
            return defaultSettings
        }

        return settings
    } catch {
        return defaultSettings
    }
}

export async function DynamicHero() {
    const settings = await getSiteSettings()

    const showText = settings.heroShowText ?? true
    const showBadge = settings.heroShowBadge ?? true
    const badgeText = settings.heroBadgeText || "New Collection 2026"

    const showButton1 = settings.heroShowButton1 ?? true
    const button1Text = settings.heroButton1Text || "Shop Now"
    const button1Link = settings.heroButton1Link || "/products"

    const showButton2 = settings.heroShowButton2 ?? true
    const button2Text = settings.heroButton2Text || "Explore Categories"
    const button2Link = settings.heroButton2Link || "/categories"

    return (
        <section className="pt-24 md:pt-28 pb-8 md:pb-12 bg-gradient-to-b from-secondary/50 to-background">
            <div className="container mx-auto px-4">
                {settings.heroMode === "slider" && settings.heroSliderImages && settings.heroSliderImages.length > 0 ? (
                    <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px] lg:h-[550px]">
                        <HeroSlider
                            images={settings.heroSliderImages}
                            title={settings.heroTitle || defaultSettings.heroTitle}
                            subtitle={settings.heroSubtitle || defaultSettings.heroSubtitle}
                            showText={showText}
                            showBadge={showBadge}
                            badgeText={badgeText}
                            showButton1={showButton1}
                            button1Text={button1Text}
                            button1Link={button1Link}
                            showButton2={showButton2}
                            button2Text={button2Text}
                            button2Link={button2Link}
                        />
                    </div>
                ) : showText ? (
                    // Single image with text overlay
                    <div className="relative rounded-3xl overflow-hidden bg-gray-900">
                        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px] md:min-h-[500px] lg:min-h-[550px]">
                            {/* Left: Content */}
                            <div className="relative z-10 flex flex-col justify-center p-8 md:p-12 lg:p-16 order-2 lg:order-1">
                                <div className="space-y-6 animate-fade-in-up">
                                    {showBadge && (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium w-fit">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            <span>{badgeText}</span>
                                        </div>
                                    )}

                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                                        {settings.heroTitle || defaultSettings.heroTitle}
                                    </h1>

                                    <p className="text-base md:text-lg text-white/70 max-w-md font-light leading-relaxed">
                                        {settings.heroSubtitle || defaultSettings.heroSubtitle}
                                    </p>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {showButton1 && (
                                            <Link href={button1Link}>
                                                <Button size="lg" className="h-12 px-8 rounded-full text-base bg-white text-black hover:bg-white/90 shadow-lg transition-all hover:scale-105">
                                                    {button1Text}
                                                </Button>
                                            </Link>
                                        )}
                                        {showButton2 && (
                                            <Link href={button2Link}>
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    className="h-12 px-8 rounded-full text-base bg-transparent border-white/30 text-white hover:bg-white/10 transition-all"
                                                >
                                                    {button2Text} <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Image */}
                            <div className="relative order-1 lg:order-2 h-[250px] md:h-[300px] lg:h-auto">
                                <Image
                                    src={settings.heroImage || defaultSettings.heroImage}
                                    alt="Hero"
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                {/* Subtle overlay for blend */}
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/30 to-transparent lg:block hidden" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent lg:hidden" />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Single image without text - clean banner style
                    <div className="relative rounded-3xl overflow-hidden">
                        <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
                            <Image
                                src={settings.heroImage || defaultSettings.heroImage}
                                alt="Hero Banner"
                                fill
                                className="object-cover"
                                priority
                                sizes="100vw"
                            />
                            {/* Optional: Show buttons even without text overlay */}
                            {(showButton1 || showButton2) && (
                                <div className="absolute inset-0 flex items-end justify-center pb-8 md:pb-12 gap-3">
                                    {showButton1 && (
                                        <Link href={button1Link}>
                                            <Button size="lg" className="h-12 px-8 rounded-full text-base bg-white text-black hover:bg-white/90 shadow-lg transition-all hover:scale-105">
                                                {button1Text}
                                            </Button>
                                        </Link>
                                    )}
                                    {showButton2 && (
                                        <Link href={button2Link}>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="h-12 px-8 rounded-full text-base bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                                            >
                                                {button2Text} <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
