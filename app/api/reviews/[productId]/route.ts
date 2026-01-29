import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all reviews for a product
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params

        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        // Calculate average rating
        const totalRating = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0)
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

        return NextResponse.json({
            reviews,
            count: reviews.length,
            averageRating: Math.round(averageRating * 10) / 10,
        })
    } catch (error) {
        console.error("Error fetching reviews:", error)
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        )
    }
}

// POST a new review (requires auth + purchase verification)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to submit a review" },
                { status: 401 }
            )
        }

        const { productId } = await params
        const body = await request.json()
        const { rating, title, comment } = body

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            )
        }

        // Validate comment
        if (!comment || comment.trim().length < 10) {
            return NextResponse.json(
                { error: "Comment must be at least 10 characters" },
                { status: 400 }
            )
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
            return NextResponse.json(
                { error: "You must purchase and receive this product before reviewing" },
                { status: 403 }
            )
        }

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
            return NextResponse.json(
                { error: "You have already reviewed this product" },
                { status: 400 }
            )
        }

        // Create the review
        const review = await prisma.review.create({
            data: {
                userId: session.user.id,
                productId: productId,
                rating: Number(rating),
                title: title?.trim() || null,
                comment: comment.trim(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return NextResponse.json(review, { status: 201 })
    } catch (error) {
        console.error("Error creating review:", error)
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        )
    }
}
