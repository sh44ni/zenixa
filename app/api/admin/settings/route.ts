import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch site settings
export async function GET() {
    try {
        let settings = await prisma.siteSettings.findFirst({
            where: { id: "default" }
        })

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    id: "default",
                    heroMode: "image",
                    heroTitle: "Discover Quality Products at Amazing Prices",
                    heroSubtitle: "Shop the latest trends in electronics, fashion, home essentials, and more.",
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Error fetching settings:", error)
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        )
    }
}

// PUT - Update site settings
export async function PUT(request: Request) {
    try {
        const session = await getServerSession()

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const data = await request.json()

        // Validate slider images (max 5)
        if (data.heroSliderImages && data.heroSliderImages.length > 5) {
            return NextResponse.json(
                { error: "Maximum 5 slider images allowed" },
                { status: 400 }
            )
        }

        const settings = await prisma.siteSettings.upsert({
            where: { id: "default" },
            update: {
                heroMode: data.heroMode,
                heroImage: data.heroImage,
                heroSliderImages: data.heroSliderImages || [],
                heroTitle: data.heroTitle,
                heroSubtitle: data.heroSubtitle,
                primaryColor: data.primaryColor,
                secondaryColor: data.secondaryColor,
                accentColor: data.accentColor,
                colorSelectionMode: data.colorSelectionMode,
            },
            create: {
                id: "default",
                heroMode: data.heroMode || "image",
                heroImage: data.heroImage,
                heroSliderImages: data.heroSliderImages || [],
                heroTitle: data.heroTitle || "Discover Quality Products",
                heroSubtitle: data.heroSubtitle || "Shop the latest trends.",
                primaryColor: data.primaryColor || "221.2 83.2% 53.3%",
                secondaryColor: data.secondaryColor || "210 40% 96.1%",
                accentColor: data.accentColor || "210 40% 96.1%",
                colorSelectionMode: data.colorSelectionMode || "text",
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Error updating settings:", error)
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        )
    }
}
