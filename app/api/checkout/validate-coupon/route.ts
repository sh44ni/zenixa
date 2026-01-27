import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const { code } = await request.json()

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 })
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        })

        if (!coupon) {
            return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 404 })
        }

        if (!coupon.isActive) {
            return NextResponse.json({ valid: false, error: "Coupon is inactive" }, { status: 400 })
        }

        const now = new Date()
        if (coupon.startDate && now < coupon.startDate) {
            return NextResponse.json({ valid: false, error: "Coupon not yet active" }, { status: 400 })
        }
        if (coupon.endDate && now > coupon.endDate) {
            return NextResponse.json({ valid: false, error: "Coupon expired" }, { status: 400 })
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ valid: false, error: "Coupon usage limit reached" }, { status: 400 })
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value
            }
        })
    } catch (error) {
        return NextResponse.json({ error: "Validation failed" }, { status: 500 })
    }
}
