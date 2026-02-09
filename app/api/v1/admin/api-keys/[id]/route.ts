import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/v1/admin/api-keys/[id]
 *
 * Update an API key (name, permissions, active status, expiry).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.permissions !== undefined) updateData.permissions = body.permissions
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        permissions: apiKey.permissions,
        isActive: apiKey.isActive,
        expiresAt: apiKey.expiresAt,
      },
    })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }
    console.error("API key update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/admin/api-keys/[id]
 *
 * Permanently delete an API key.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.apiKey.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }
    console.error("API key delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
