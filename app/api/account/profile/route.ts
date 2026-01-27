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
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                phone: true,
                address: true,
                city: true,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, phone, address, city } = body

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone,
                address,
                city,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
}
