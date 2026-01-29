import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch single policy by slug
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const policy = await prisma.policyPage.findUnique({
            where: { slug }
        })

        if (!policy) {
            return NextResponse.json(
                { error: "Policy not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(policy)
    } catch (error) {
        console.error("Error fetching policy:", error)
        return NextResponse.json(
            { error: "Failed to fetch policy" },
            { status: 500 }
        )
    }
}

// PUT - Update policy page
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params
        const data = await request.json()

        const policy = await prisma.policyPage.update({
            where: { slug },
            data: {
                title: data.title,
                content: data.content,
                isActive: data.isActive,
            }
        })

        return NextResponse.json(policy)
    } catch (error: any) {
        console.error("Error updating policy:", error)
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Policy not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: "Failed to update policy" },
            { status: 500 }
        )
    }
}

// DELETE - Delete policy page
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getServerSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params
        await prisma.policyPage.delete({
            where: { slug }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error deleting policy:", error)
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Policy not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: "Failed to delete policy" },
            { status: 500 }
        )
    }
}
