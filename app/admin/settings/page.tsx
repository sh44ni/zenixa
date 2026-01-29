import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeSettingsForm } from "@/components/admin/theme-settings-form"
import { FooterSettings } from "@/components/admin/footer-settings"
import { Palette, Globe, Settings, AlertCircle } from "lucide-react"

// Default settings
const defaultSettings = {
    id: "default",
    heroMode: "image",
    heroImage: null as string | null,
    heroSliderImages: [] as string[],
    heroTitle: "Discover Quality Products at Amazing Prices",
    heroSubtitle: "Shop the latest trends in electronics, fashion, home essentials, and more.",
    primaryColor: "221.2 83.2% 53.3%",
    secondaryColor: "210 40% 96.1%",
    accentColor: "210 40% 96.1%",
    colorSelectionMode: "text",
    featureBadges: [] as unknown[],
    promoBannerEnabled: false,
    promoBannerImage: null as string | null,
    promoBannerLink: null as string | null,
    promoBannerWidth: 1200,
    promoBannerHeight: 300,
    createdAt: new Date(),
    updatedAt: new Date(),
}

async function getSiteSettings() {
    try {
        let settings = await prisma.siteSettings.findFirst({
            where: { id: "default" }
        })

        // Create default settings if none exist
        if (!settings) {
            try {
                settings = await prisma.siteSettings.create({
                    data: {
                        id: "default",
                        heroMode: "image",
                        heroTitle: defaultSettings.heroTitle,
                        heroSubtitle: defaultSettings.heroSubtitle,
                    }
                })
            } catch {
                // If creation fails, return defaults
                return defaultSettings
            }
        }

        return settings
    } catch (error) {
        console.error("Error fetching site settings:", error)
        return null
    }
}

export default async function SettingsPage() {
    const settings = await getSiteSettings()

    if (!settings) {
        return (
            <div className="space-y-4 animate-fade-in">
                <div>
                    <h1 className="admin-page-title flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Settings
                    </h1>
                </div>
                <div className="admin-list-card border-[hsl(0,84%,60%)]">
                    <div className="p-6">
                        <div className="flex items-center gap-2 text-[hsl(0,84%,60%)] font-semibold mb-2">
                            <AlertCircle className="h-5 w-5" />
                            Error Loading Settings
                        </div>
                        <p className="text-sm text-[hsl(220,9%,46%)]">
                            There was an error loading site settings from the database.
                            Please check your database connection and try again.
                        </p>
                        <p className="text-sm text-[hsl(220,9%,46%)] mt-3">
                            Make sure you have run <code className="bg-[hsl(220,14%,96%)] px-1.5 py-0.5 rounded">npx prisma db push</code> and <code className="bg-[hsl(220,14%,96%)] px-1.5 py-0.5 rounded">npx prisma generate</code>.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="admin-page-title">Settings</h1>
                <p className="admin-page-subtitle hidden md:block">
                    Customize your store's appearance
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="theme" className="space-y-4">
                <TabsList className="w-full grid grid-cols-2 h-12 rounded-xl bg-[hsl(220,14%,96%)] p-1">
                    <TabsTrigger
                        value="theme"
                        className="rounded-lg h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <Palette className="h-4 w-4 mr-2" />
                        Theme Colors
                    </TabsTrigger>
                    <TabsTrigger
                        value="footer"
                        className="rounded-lg h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <Globe className="h-4 w-4 mr-2" />
                        Footer
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="theme" className="mt-4">
                    <ThemeSettingsForm settings={settings} />
                </TabsContent>

                <TabsContent value="footer" className="mt-4">
                    <FooterSettings settings={settings} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

