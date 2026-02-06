import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET - List all media with pagination
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const skip = (page - 1) * limit

        const [media, total] = await Promise.all([
            prisma.media.findMany({
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.media.count(),
        ])

        return NextResponse.json({
            media,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error("Media fetch error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST - Upload file
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG" },
                { status: 400 }
            )
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary using promise wrapper
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "zenixa-uploads",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        })

        // Create media record
        const media = await prisma.media.create({
            data: {
                filename: file.name,
                url: uploadResult.secure_url,
                mimeType: file.type,
                size: file.size,
                width: uploadResult.width,
                height: uploadResult.height,
            },
        })

        return NextResponse.json(media)
    } catch (error) {
        console.error("Media upload error:", error)
        return NextResponse.json(
            { error: "Failed to upload file to Cloudinary" },
            { status: 500 }
        )
    }
}
