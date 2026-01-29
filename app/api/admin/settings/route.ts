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

        // Build update object with only defined fields (prevents stale data overwrites)
        const updateData: Record<string, unknown> = {}

        // Hero fields
        if (data.heroMode !== undefined) updateData.heroMode = data.heroMode
        if (data.heroImage !== undefined) updateData.heroImage = data.heroImage
        if (data.heroSliderImages !== undefined) updateData.heroSliderImages = data.heroSliderImages
        if (data.heroTitle !== undefined) updateData.heroTitle = data.heroTitle
        if (data.heroSubtitle !== undefined) updateData.heroSubtitle = data.heroSubtitle
        if (data.heroShowText !== undefined) updateData.heroShowText = data.heroShowText
        if (data.heroShowBadge !== undefined) updateData.heroShowBadge = data.heroShowBadge
        if (data.heroBadgeText !== undefined) updateData.heroBadgeText = data.heroBadgeText
        if (data.heroShowButton1 !== undefined) updateData.heroShowButton1 = data.heroShowButton1
        if (data.heroButton1Text !== undefined) updateData.heroButton1Text = data.heroButton1Text
        if (data.heroButton1Link !== undefined) updateData.heroButton1Link = data.heroButton1Link
        if (data.heroShowButton2 !== undefined) updateData.heroShowButton2 = data.heroShowButton2
        if (data.heroButton2Text !== undefined) updateData.heroButton2Text = data.heroButton2Text
        if (data.heroButton2Link !== undefined) updateData.heroButton2Link = data.heroButton2Link
        if (data.heroImageWidth !== undefined) updateData.heroImageWidth = data.heroImageWidth
        if (data.heroImageHeight !== undefined) updateData.heroImageHeight = data.heroImageHeight

        // Theme fields
        if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor
        if (data.secondaryColor !== undefined) updateData.secondaryColor = data.secondaryColor
        if (data.accentColor !== undefined) updateData.accentColor = data.accentColor
        if (data.colorSelectionMode !== undefined) updateData.colorSelectionMode = data.colorSelectionMode
        if (data.featureBadges !== undefined) updateData.featureBadges = data.featureBadges

        // Promo Banner fields
        if (data.promoBannerEnabled !== undefined) updateData.promoBannerEnabled = data.promoBannerEnabled
        if (data.promoBannerImage !== undefined) updateData.promoBannerImage = data.promoBannerImage
        if (data.promoBannerLink !== undefined) updateData.promoBannerLink = data.promoBannerLink
        if (data.promoBannerWidth !== undefined) updateData.promoBannerWidth = data.promoBannerWidth
        if (data.promoBannerHeight !== undefined) updateData.promoBannerHeight = data.promoBannerHeight

        // Footer fields
        if (data.footerBrandText !== undefined) updateData.footerBrandText = data.footerBrandText
        if (data.footerEmail !== undefined) updateData.footerEmail = data.footerEmail
        if (data.footerPhone !== undefined) updateData.footerPhone = data.footerPhone
        if (data.footerAddress !== undefined) updateData.footerAddress = data.footerAddress
        if (data.footerSocialLinks !== undefined) updateData.footerSocialLinks = data.footerSocialLinks

        // Product Badge fields
        if (data.productBadge1Icon !== undefined) updateData.productBadge1Icon = data.productBadge1Icon
        if (data.productBadge1Title !== undefined) updateData.productBadge1Title = data.productBadge1Title
        if (data.productBadge1Subtitle !== undefined) updateData.productBadge1Subtitle = data.productBadge1Subtitle
        if (data.productBadge1Enabled !== undefined) updateData.productBadge1Enabled = data.productBadge1Enabled
        if (data.productBadge2Icon !== undefined) updateData.productBadge2Icon = data.productBadge2Icon
        if (data.productBadge2Title !== undefined) updateData.productBadge2Title = data.productBadge2Title
        if (data.productBadge2Subtitle !== undefined) updateData.productBadge2Subtitle = data.productBadge2Subtitle
        if (data.productBadge2Enabled !== undefined) updateData.productBadge2Enabled = data.productBadge2Enabled

        // Delivery Settings fields
        if (data.deliveryCharges !== undefined) updateData.deliveryCharges = data.deliveryCharges
        if (data.freeDeliveryEnabled !== undefined) updateData.freeDeliveryEnabled = data.freeDeliveryEnabled
        if (data.freeDeliveryThreshold !== undefined) updateData.freeDeliveryThreshold = data.freeDeliveryThreshold
        if (data.alwaysFreeDelivery !== undefined) updateData.alwaysFreeDelivery = data.alwaysFreeDelivery

        const settings = await prisma.siteSettings.upsert({
            where: { id: "default" },
            update: updateData,
            create: {
                id: "default",
                heroMode: data.heroMode || "image",
                heroImage: data.heroImage,
                heroSliderImages: data.heroSliderImages || [],
                heroTitle: data.heroTitle || "Discover Quality Products",
                heroSubtitle: data.heroSubtitle || "Shop the latest trends.",
                heroShowText: data.heroShowText ?? true,
                heroShowBadge: data.heroShowBadge ?? true,
                heroBadgeText: data.heroBadgeText || "New Collection 2026",
                heroShowButton1: data.heroShowButton1 ?? true,
                heroButton1Text: data.heroButton1Text || "Shop Now",
                heroButton1Link: data.heroButton1Link || "/products",
                heroShowButton2: data.heroShowButton2 ?? true,
                heroButton2Text: data.heroButton2Text || "Explore Categories",
                heroButton2Link: data.heroButton2Link || "/categories",
                heroImageWidth: data.heroImageWidth || 1920,
                heroImageHeight: data.heroImageHeight || 800,
                primaryColor: data.primaryColor || "221.2 83.2% 53.3%",
                secondaryColor: data.secondaryColor || "210 40% 96.1%",
                accentColor: data.accentColor || "210 40% 96.1%",
                colorSelectionMode: data.colorSelectionMode || "text",
                featureBadges: data.featureBadges || [],
                promoBannerEnabled: data.promoBannerEnabled || false,
                promoBannerImage: data.promoBannerImage,
                promoBannerLink: data.promoBannerLink,
                promoBannerWidth: data.promoBannerWidth || 1200,
                promoBannerHeight: data.promoBannerHeight || 300,
                footerBrandText: data.footerBrandText,
                footerEmail: data.footerEmail,
                footerPhone: data.footerPhone,
                footerAddress: data.footerAddress,
                footerSocialLinks: data.footerSocialLinks || [],
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
