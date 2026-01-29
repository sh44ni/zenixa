import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch all FAQ items
export async function GET() {
    try {
        const faqs = await prisma.faqItem.findMany({
            orderBy: { order: "asc" }
        })
        return NextResponse.json(faqs)
    } catch (error) {
        console.error("Error fetching FAQs:", error)
        return NextResponse.json(
            { error: "Failed to fetch FAQs" },
            { status: 500 }
        )
    }
}

// POST - Create new FAQ item
export async function POST(request: Request) {
    try {
        const session = await getServerSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json()

        if (!data.question || !data.answer) {
            return NextResponse.json(
                { error: "Question and answer are required" },
                { status: 400 }
            )
        }

        // Get max order for new item
        const maxOrder = await prisma.faqItem.aggregate({
            _max: { order: true }
        })

        const faq = await prisma.faqItem.create({
            data: {
                question: data.question,
                answer: data.answer,
                category: data.category || null,
                order: (maxOrder._max.order ?? -1) + 1,
                isActive: data.isActive ?? true,
            }
        })

        return NextResponse.json(faq)
    } catch (error) {
        console.error("Error creating FAQ:", error)
        return NextResponse.json(
            { error: "Failed to create FAQ" },
            { status: 500 }
        )
    }
}

// PUT - Update FAQ item or reorder
export async function PUT(request: Request) {
    try {
        const session = await getServerSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json()

        // Handle bulk reorder
        if (data.reorder && Array.isArray(data.items)) {
            const updates = data.items.map((item: { id: string; order: number }) =>
                prisma.faqItem.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
            await prisma.$transaction(updates)
            return NextResponse.json({ success: true })
        }

        // Handle single item update
        if (!data.id) {
            return NextResponse.json(
                { error: "FAQ ID is required" },
                { status: 400 }
            )
        }

        const faq = await prisma.faqItem.update({
            where: { id: data.id },
            data: {
                question: data.question,
                answer: data.answer,
                category: data.category,
                isActive: data.isActive,
            }
        })

        return NextResponse.json(faq)
    } catch (error: any) {
        console.error("Error updating FAQ:", error)
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "FAQ not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: "Failed to update FAQ" },
            { status: 500 }
        )
    }
}

// DELETE - Delete FAQ item
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                { error: "FAQ ID is required" },
                { status: 400 }
            )
        }

        await prisma.faqItem.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error deleting FAQ:", error)
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "FAQ not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: "Failed to delete FAQ" },
            { status: 500 }
        )
    }
}
