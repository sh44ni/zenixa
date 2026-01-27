import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

// POST - Import image from URL
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { url } = await request.json()

        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 })
        }

        // Fetch the image from URL
        const response = await fetch(url)
        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch image from URL" }, { status: 400 })
        }

        const contentType = response.headers.get("content-type") || "image/jpeg"
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

        if (!validTypes.some(type => contentType.includes(type))) {
            return NextResponse.json(
                { error: "URL does not point to a valid image" },
                { status: 400 }
            )
        }

        // Get image data
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Create uploads directory if not exists
        const uploadDir = path.join(process.cwd(), "public", "uploads")
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Generate filename from URL or create one
        let ext = "jpg"
        if (contentType.includes("png")) ext = "png"
        else if (contentType.includes("gif")) ext = "gif"
        else if (contentType.includes("webp")) ext = "webp"
        else if (contentType.includes("svg")) ext = "svg"

        const timestamp = Date.now()
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`
        const filepath = path.join(uploadDir, filename)

        // Write file to disk
        await writeFile(filepath, buffer)

        // Extract original filename from URL if possible
        const urlParts = new URL(url).pathname.split("/")
        const originalFilename = urlParts[urlParts.length - 1] || `imported-${timestamp}`

        // Create media record
        const media = await prisma.media.create({
            data: {
                filename: originalFilename,
                originalUrl: url,
                url: `/uploads/${filename}`,
                mimeType: contentType,
                size: buffer.length,
            },
        })

        return NextResponse.json(media)
    } catch (error) {
        console.error("Media import error:", error)
        return NextResponse.json(
            { error: "Failed to import image from URL" },
            { status: 500 }
        )
    }
}
