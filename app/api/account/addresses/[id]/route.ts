import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Verify ownership
        const address = await prisma.address.findUnique({
            where: { id: params.id }
        })

        if (!address || address.userId !== session.user.id) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 })
        }

        await prisma.address.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
    }
}
