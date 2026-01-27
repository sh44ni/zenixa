import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(coupons)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            code,
            value,
            type,
            startDate,
            endDate,
            usageLimit
        } = body

        // Basic validation
        if (!code || !value) {
            return NextResponse.json({ error: "Code and value are required" }, { status: 400 })
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                value: parseFloat(value),
                type: type || "PERCENTAGE",
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
            }
        })

        return NextResponse.json(coupon)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
    }
}
