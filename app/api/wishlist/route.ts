import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        images: true,
                        category: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(wishlist)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { productId } = await request.json()

        // Check if exists
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId
                }
            }
        })

        if (existing) {
            await prisma.wishlist.delete({
                where: { id: existing.id }
            })
            return NextResponse.json({ action: "removed" })
        } else {
            await prisma.wishlist.create({
                data: {
                    userId: session.user.id,
                    productId
                }
            })
            return NextResponse.json({ action: "added" })
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 })
    }
}
