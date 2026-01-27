import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cloneExternalImages } from "@/lib/clone-image"

// POST - Migrate all external images to local storage
export async function POST() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get all products with images
        const products = await prisma.product.findMany({
            select: { id: true, images: true },
        })

        let totalCloned = 0
        let totalUpdated = 0

        for (const product of products) {
            // Find external images
            const externalImages = product.images.filter(
                (url: string) => url.startsWith("http://") || url.startsWith("https://")
            )

            if (externalImages.length === 0) continue

            // Clone external images
            const clonedUrls = await cloneExternalImages(externalImages)

            // Create mapping of old to new URLs
            const urlMap = new Map<string, string>()
            externalImages.forEach((oldUrl: string, i: number) => {
                if (clonedUrls[i] !== oldUrl) {
                    urlMap.set(oldUrl, clonedUrls[i])
                    totalCloned++
                }
            })

            // Update product if any images were cloned
            if (urlMap.size > 0) {
                const newImages = product.images.map((url: string) => urlMap.get(url) || url)
                await prisma.product.update({
                    where: { id: product.id },
                    data: { images: newImages },
                })
                totalUpdated++
            }
        }

        return NextResponse.json({
            success: true,
            productsUpdated: totalUpdated,
            imagesCloned: totalCloned,
        })
    } catch (error) {
        console.error("Migration error:", error)
        return NextResponse.json(
            { error: "Failed to migrate images" },
            { status: 500 }
        )
    }
}
