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
    heroTitle: "Future of Shopping",
    heroSubtitle: "Experience the next generation of e-commerce. Curated collections, lightning fast delivery, and premium quality.",
}

async function getSiteSettings() {
    try {
        let settings = await prisma.siteSettings.findFirst({
            where: { id: "default" }
        })

        if (!settings) {
            // Fallback logic
            return defaultSettings
        }

        return settings
    } catch (error) {
        return defaultSettings
    }
}

export async function DynamicHero() {
    const settings = await getSiteSettings()

    return (
        <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
            {settings.heroMode === "slider" && settings.heroSliderImages && settings.heroSliderImages.length > 0 ? (
                <div className="absolute inset-0">
                    <HeroSlider
                        images={settings.heroSliderImages}
                        title={settings.heroTitle || defaultSettings.heroTitle}
                        subtitle={settings.heroSubtitle || defaultSettings.heroSubtitle}
                    />
                </div>
            ) : (
                // Single image immersive mode
                <>
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={settings.heroImage || defaultSettings.heroImage}
                            alt="Hero"
                            fill
                            className="object-cover transition-transform duration-[20s] hover:scale-105"
                            priority
                        />
                        {/* Advanced Gradient Overlay Removed as per request */}
                        {/* <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" /> */}
                        {/* <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" /> */}
                        {/* Keep minimal overlay so white text is readable? Or remove entirely? 
                            User said "remove the white shadow kinda thing".
                            Usually that refers to "from-background via-background/40".
                            But if I remove ALL overlays, white text on light image might be unreadable.
                            I will remove the specific gradients but ensure text has drop-shadow.
                        */}
                        <div className="absolute inset-0 bg-black/10" /> {/* Very subtle global dim */}
                    </div>

                    <div className="relative z-10 container mx-auto px-4 mt-20">
                        <div className="max-w-3xl space-y-8 animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span>New Collection 2026</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                                {settings.heroTitle || defaultSettings.heroTitle}
                            </h1>

                            <p className="text-lg md:text-xl text-white/80 max-w-xl font-light leading-relaxed">
                                {settings.heroSubtitle || defaultSettings.heroSubtitle}
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link href="/products">
                                    <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 border-0">
                                        Start Shopping
                                    </Button>
                                </Link>
                                <Link href="/categories">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-14 px-8 rounded-full text-lg bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all"
                                    >
                                        Explore Categories <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    )
}
