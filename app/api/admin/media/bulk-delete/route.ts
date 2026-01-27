import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { ids } = await request.json()

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 })
        }

        // Get media records to delete files
        const mediaItems = await prisma.media.findMany({
            where: { id: { in: ids } },
        })

        // Delete files from disk
        for (const media of mediaItems) {
            const filepath = path.join(process.cwd(), "public", media.url)
            if (existsSync(filepath)) {
                await unlink(filepath)
            }
        }

        // Delete database records
        const result = await prisma.media.deleteMany({
            where: { id: { in: ids } },
        })

        return NextResponse.json({
            success: true,
            deleted: result.count,
        })
    } catch (error) {
        console.error("Bulk delete media error:", error)
        return NextResponse.json(
            { error: "Failed to delete media" },
            { status: 500 }
        )
    }
}
