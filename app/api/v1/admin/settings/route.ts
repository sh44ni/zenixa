import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/settings
 * Permission: settings:read
 *
 * Returns all site settings, payment settings, and policies.
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "settings:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const [settings, paymentSettings, policies] = await Promise.all([
      prisma.siteSettings.findFirst({ where: { id: "default" } }),
      prisma.paymentSettings.findFirst(),
      prisma.policyPage.findMany(),
    ])

    return withCors(apiSuccess({ site: settings, payment: paymentSettings, policies }))
  } catch (error) {
    console.error("Admin settings get error:", error)
    return withCors(apiServerError())
  }
}

/**
 * PUT /api/v1/admin/settings
 * Permission: settings:write
 *
 * Update site settings. Send only the fields you want to update.
 * See GET response for available fields.
 */
export async function PUT(request: NextRequest) {
  const auth = await requirePermission(request, "settings:write")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const data = await request.json()
    const { site, payment } = data

    let updatedSite = null
    let updatedPayment = null

    if (site) {
      const updateData: Record<string, unknown> = {}
      const siteFields = [
        "heroMode", "heroImage", "heroSliderImages", "heroTitle", "heroSubtitle",
        "heroShowText", "heroShowBadge", "heroBadgeText",
        "heroShowButton1", "heroButton1Text", "heroButton1Link",
        "heroShowButton2", "heroButton2Text", "heroButton2Link",
        "heroImageWidth", "heroImageHeight",
        "primaryColor", "secondaryColor", "accentColor", "colorSelectionMode",
        "featureBadges",
        "productBadge1Icon", "productBadge1Title", "productBadge1Subtitle", "productBadge1Enabled",
        "productBadge2Icon", "productBadge2Title", "productBadge2Subtitle", "productBadge2Enabled",
        "deliveryCharges", "freeDeliveryEnabled", "freeDeliveryThreshold", "alwaysFreeDelivery",
        "ctaBannerImage", "ctaBannerTitle", "ctaBannerSubtitle", "ctaBannerButtonText", "ctaBannerLink",
        "promoBannerEnabled", "promoBannerImage", "promoBannerLink", "promoBannerWidth", "promoBannerHeight",
        "footerBrandText", "footerEmail", "footerPhone", "footerAddress", "footerSocialLinks",
      ]
      for (const field of siteFields) {
        if (site[field] !== undefined) updateData[field] = site[field]
      }

      updatedSite = await prisma.siteSettings.upsert({
        where: { id: "default" },
        update: updateData,
        create: { id: "default", ...updateData } as any,
      })
    }

    if (payment) {
      const existing = await prisma.paymentSettings.findFirst()
      const paymentData = {
        bankTransferEnabled: payment.bankTransferEnabled,
        codEnabled: payment.codEnabled,
        requireScreenshot: payment.requireScreenshot,
        bankName: payment.bankName,
        accountTitle: payment.accountTitle,
        accountNumber: payment.accountNumber,
        iban: payment.iban,
        bankInstructions: payment.bankInstructions,
      }

      if (existing) {
        updatedPayment = await prisma.paymentSettings.update({
          where: { id: existing.id },
          data: paymentData,
        })
      } else {
        updatedPayment = await prisma.paymentSettings.create({ data: paymentData })
      }
    }

    dispatchWebhook("settings.updated", { site: !!site, payment: !!payment }).catch(() => {})

    return withCors(apiSuccess({ site: updatedSite, payment: updatedPayment }))
  } catch (error) {
    console.error("Admin settings update error:", error)
    return withCors(apiServerError())
  }
}
