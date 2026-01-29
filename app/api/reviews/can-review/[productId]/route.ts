import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Check if the current user can review this product
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        // Not logged in - can't review
        if (!session?.user?.id) {
            return NextResponse.json({
                canReview: false,
                reason: "not_logged_in",
                message: "Please sign in to leave a review",
            })
        }

        const { productId } = await params

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId: productId,
                },
            },
        })

        if (existingReview) {
            return NextResponse.json({
                canReview: false,
                reason: "already_reviewed",
                message: "You have already reviewed this product",
            })
        }

        // Check if user has a delivered order containing this product
        const hasDeliveredOrder = await prisma.order.findFirst({
            where: {
                userId: session.user.id,
                status: "DELIVERED",
                items: {
                    some: {
                        productId: productId,
                    },
                },
            },
        })

        if (!hasDeliveredOrder) {
            return NextResponse.json({
                canReview: false,
                reason: "no_purchase",
                message: "Purchase this product to leave a review",
            })
        }

        // User can review
        return NextResponse.json({
            canReview: true,
            reason: "eligible",
            message: "You can review this product",
        })
    } catch (error) {
        console.error("Error checking review eligibility:", error)
        return NextResponse.json(
            { canReview: false, reason: "error", message: "An error occurred" },
            { status: 500 }
        )
    }
}
