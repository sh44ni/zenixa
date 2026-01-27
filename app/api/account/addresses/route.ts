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
        const addresses = await prisma.address.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(addresses)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, address, city, phone, isDefault } = body

        if (isDefault) {
            // Unset other defaults
            await prisma.address.updateMany({
                where: { userId: session.user.id },
                data: { isDefault: false }
            })
        }

        const newAddress = await prisma.address.create({
            data: {
                userId: session.user.id,
                name,
                address,
                city,
                phone,
                isDefault: isDefault || false,
            }
        })

        return NextResponse.json(newAddress)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
    }
}
