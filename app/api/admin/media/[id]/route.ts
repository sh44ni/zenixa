import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

// DELETE - Remove media file and record
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Find media record
        const media = await prisma.media.findUnique({
            where: { id },
        })

        if (!media) {
            return NextResponse.json({ error: "Media not found" }, { status: 404 })
        }

        // Delete file from disk
        const filepath = path.join(process.cwd(), "public", media.url)
        if (existsSync(filepath)) {
            await unlink(filepath)
        }

        // Delete database record
        await prisma.media.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Media delete error:", error)
        return NextResponse.json(
            { error: "Failed to delete media" },
            { status: 500 }
        )
    }
}
