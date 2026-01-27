
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    await prisma.siteSettings.upsert({
        where: { id: "default" },
        update: { colorSelectionMode: "image" },
        create: {
            id: "default",
            colorSelectionMode: "image",
        }
    })
    console.log("Updated colorSelectionMode to 'image'")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
