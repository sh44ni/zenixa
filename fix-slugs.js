const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

async function main() {
    const products = await prisma.product.findMany()

    for (const product of products) {
        // Check if slug has spaces or caps
        const cleanSlug = generateSlug(product.slug)

        if (cleanSlug !== product.slug) {
            console.log(`Fixing product: ${product.name} (ID: ${product.id})`)
            console.log(`  Old Slug: "${product.slug}"`)
            console.log(`  New Slug: "${cleanSlug}"`)

            try {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { slug: cleanSlug }
                })
                console.log("  Fixed!")
            } catch (e) {
                console.log("  Failed to fix (maybe duplicate slug?):", e.message)
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
