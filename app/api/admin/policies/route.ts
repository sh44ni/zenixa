import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch all policy pages
export async function GET() {
    try {
        const policies = await prisma.policyPage.findMany({
            orderBy: { updatedAt: "desc" }
        })
        return NextResponse.json(policies)
    } catch (error) {
        console.error("Error fetching policies:", error)
        return NextResponse.json(
            { error: "Failed to fetch policies" },
            { status: 500 }
        )
    }
}

// POST - Create a new policy page
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json()

        // Validate required fields
        if (!data.slug || !data.title) {
            return NextResponse.json(
                { error: "Slug and title are required" },
                { status: 400 }
            )
        }

        const policy = await prisma.policyPage.create({
            data: {
                slug: data.slug,
                title: data.title,
                content: data.content || "",
                isActive: data.isActive ?? true,
            }
        })

        return NextResponse.json(policy)
    } catch (error: any) {
        console.error("Error creating policy:", error)
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "A policy with this slug already exists" },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: "Failed to create policy" },
            { status: 500 }
        )
    }
}
