import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let settings = await prisma.paymentSettings.findFirst()

    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: {
          bankTransferEnabled: true,
          codEnabled: true,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Payment settings fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const {
      bankTransferEnabled,
      codEnabled,
      bankName,
      accountTitle,
      accountNumber,
      iban,
      bankInstructions,
    } = data

    let settings = await prisma.paymentSettings.findFirst()

    if (settings) {
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: {
          bankTransferEnabled,
          codEnabled,
          bankName,
          accountTitle,
          accountNumber,
          iban,
          bankInstructions,
        },
      })
    } else {
      settings = await prisma.paymentSettings.create({
        data: {
          bankTransferEnabled,
          codEnabled,
          bankName,
          accountTitle,
          accountNumber,
          iban,
          bankInstructions,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Payment settings update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
