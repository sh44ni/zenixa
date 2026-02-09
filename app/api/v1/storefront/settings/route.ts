import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/settings
 *
 * Returns all storefront-facing settings: hero, theme, delivery, footer, badges.
 * These settings control how the storefront looks and behaves.
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const [settings, paymentSettings] = await Promise.all([
      prisma.siteSettings.findFirst({ where: { id: "default" } }),
      prisma.paymentSettings.findFirst(),
    ])

    return withCors(apiSuccess({
      hero: {
        mode: settings?.heroMode || "image",
        image: settings?.heroImage,
        sliderImages: settings?.heroSliderImages || [],
        title: settings?.heroTitle,
        subtitle: settings?.heroSubtitle,
        showText: settings?.heroShowText ?? true,
        showBadge: settings?.heroShowBadge ?? true,
        badgeText: settings?.heroBadgeText,
        showButton1: settings?.heroShowButton1 ?? true,
        button1Text: settings?.heroButton1Text,
        button1Link: settings?.heroButton1Link,
        showButton2: settings?.heroShowButton2 ?? true,
        button2Text: settings?.heroButton2Text,
        button2Link: settings?.heroButton2Link,
        imageWidth: settings?.heroImageWidth,
        imageHeight: settings?.heroImageHeight,
      },
      theme: {
        primaryColor: settings?.primaryColor,
        secondaryColor: settings?.secondaryColor,
        accentColor: settings?.accentColor,
        colorSelectionMode: settings?.colorSelectionMode,
      },
      productBadges: {
        badge1: {
          icon: settings?.productBadge1Icon,
          title: settings?.productBadge1Title,
          subtitle: settings?.productBadge1Subtitle,
          enabled: settings?.productBadge1Enabled ?? true,
        },
        badge2: {
          icon: settings?.productBadge2Icon,
          title: settings?.productBadge2Title,
          subtitle: settings?.productBadge2Subtitle,
          enabled: settings?.productBadge2Enabled ?? true,
        },
      },
      featureBadges: settings?.featureBadges || [],
      delivery: {
        charges: settings?.deliveryCharges ?? 250,
        freeDeliveryEnabled: settings?.freeDeliveryEnabled ?? true,
        freeDeliveryThreshold: settings?.freeDeliveryThreshold ?? 5000,
        alwaysFreeDelivery: settings?.alwaysFreeDelivery ?? false,
      },
      ctaBanner: {
        image: settings?.ctaBannerImage,
        title: settings?.ctaBannerTitle,
        subtitle: settings?.ctaBannerSubtitle,
        buttonText: settings?.ctaBannerButtonText,
        link: settings?.ctaBannerLink,
      },
      promoBanner: {
        enabled: settings?.promoBannerEnabled ?? false,
        image: settings?.promoBannerImage,
        link: settings?.promoBannerLink,
        width: settings?.promoBannerWidth,
        height: settings?.promoBannerHeight,
      },
      footer: {
        brandText: settings?.footerBrandText,
        email: settings?.footerEmail,
        phone: settings?.footerPhone,
        address: settings?.footerAddress,
        socialLinks: settings?.footerSocialLinks || [],
      },
      payment: {
        bankTransferEnabled: paymentSettings?.bankTransferEnabled ?? true,
        codEnabled: paymentSettings?.codEnabled ?? true,
        requireScreenshot: paymentSettings?.requireScreenshot ?? false,
        bankName: paymentSettings?.bankName,
        accountTitle: paymentSettings?.accountTitle,
        accountNumber: paymentSettings?.accountNumber,
        iban: paymentSettings?.iban,
        bankInstructions: paymentSettings?.bankInstructions,
      },
    }))
  } catch (error) {
    console.error("Storefront settings error:", error)
    return withCors(apiServerError())
  }
}
