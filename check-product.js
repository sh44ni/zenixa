const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const product = await prisma.product.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { variants: true }
    })

    if (!product) {
        console.log("No products found.")
    } else {
        console.log("Latest Product:")
        console.log(`Name: ${product.name}`)
        console.log(`Slug: ${product.slug}`)
        console.log(`ID: ${product.id}`)
        console.log(`Variants: ${product.variants.length}`)
        console.log(`URL should be: /products/${product.slug}`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
