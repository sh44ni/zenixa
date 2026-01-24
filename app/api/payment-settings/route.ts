import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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
