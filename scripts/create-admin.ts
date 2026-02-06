// Script to create an admin user for the admin panel
// Run with: npx ts-node scripts/create-admin.ts
// Or: node --loader ts-node/esm scripts/create-admin.ts

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import * as readline from "readline"

const prisma = new PrismaClient()

function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close()
            resolve(answer)
        })
    })
}

async function main() {
    console.log("\n🔐 Create Admin User\n")
    console.log("This will create a new admin user for the admin panel.\n")

    const email = await prompt("Email: ")
    const password = await prompt("Password: ")
    const name = await prompt("Name (optional): ")

    if (!email || !password) {
        console.error("❌ Email and password are required!")
        process.exit(1)
    }

    if (password.length < 6) {
        console.error("❌ Password must be at least 6 characters!")
        process.exit(1)
    }

    // Check if admin already exists
    const existing = await prisma.adminUser.findUnique({
        where: { email }
    })

    if (existing) {
        console.error(`❌ Admin user with email "${email}" already exists!`)
        process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.adminUser.create({
        data: {
            email,
            password: hashedPassword,
            name: name || null,
        }
    })

    console.log(`\n✅ Admin user created successfully!`)
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name || "(not set)"}`)
    console.log(`\nYou can now log in at /admin/login\n`)
}

main()
    .catch((e) => {
        console.error("Error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
