import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@zenixa.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@zenixa.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  })
  console.log("Admin user created:", admin.email)

  // Create sample customer
  const customerPassword = await bcrypt.hash("customer123", 10)
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "John Doe",
      password: customerPassword,
      phone: "+92 300 1234567",
      address: "123 Main Street, Gulberg",
      city: "Lahore",
      role: "USER",
    },
  })
  console.log("Sample customer created:", customer.email)

  // Create categories
  const categories = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Latest gadgets and electronic devices",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    },
    {
      name: "Clothing",
      slug: "clothing",
      description: "Trendy fashion for men and women",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    },
    {
      name: "Home & Garden",
      slug: "home-garden",
      description: "Everything for your home and garden",
      image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
    },
    {
      name: "Sports & Fitness",
      slug: "sports-fitness",
      description: "Sports equipment and fitness gear",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
    },
    {
      name: "Books & Stationery",
      slug: "books-stationery",
      description: "Books, notebooks, and office supplies",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    },
    {
      name: "Beauty & Health",
      slug: "beauty-health",
      description: "Beauty products and health essentials",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    },
  ]

  const createdCategories: any = {}
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    createdCategories[category.slug] = created
    console.log("Category created:", created.name)
  }

  // Create products
  const products = [
    // Electronics
    {
      name: "Wireless Bluetooth Earbuds Pro",
      slug: "wireless-bluetooth-earbuds-pro",
      description: "Premium wireless earbuds with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. IPX5 water-resistant for workouts.",
      price: 8999,
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600",
      ],
      featured: true,
      categorySlug: "electronics",
      variants: [
        { color: "Black", stock: 50, priceModifier: 0 },
        { color: "White", stock: 35, priceModifier: 0 },
        { color: "Navy Blue", stock: 20, priceModifier: 500 },
      ],
    },
    {
      name: "Smart Watch Series X",
      slug: "smart-watch-series-x",
      description: "Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life. Compatible with iOS and Android.",
      price: 15999,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
      ],
      featured: true,
      categorySlug: "electronics",
      variants: [
        { color: "Space Gray", size: "40mm", stock: 25, priceModifier: 0 },
        { color: "Space Gray", size: "44mm", stock: 30, priceModifier: 2000 },
        { color: "Silver", size: "40mm", stock: 20, priceModifier: 0 },
        { color: "Silver", size: "44mm", stock: 25, priceModifier: 2000 },
      ],
    },
    {
      name: "Portable Power Bank 20000mAh",
      slug: "portable-power-bank-20000mah",
      description: "Fast charging power bank with dual USB ports and USB-C input. LED display shows remaining battery.",
      price: 3499,
      images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600"],
      featured: false,
      categorySlug: "electronics",
      variants: [
        { color: "Black", stock: 100, priceModifier: 0 },
        { color: "White", stock: 75, priceModifier: 0 },
      ],
    },
    {
      name: "Mechanical Gaming Keyboard",
      slug: "mechanical-gaming-keyboard",
      description: "RGB backlit mechanical keyboard with blue switches, N-key rollover, and programmable macro keys.",
      price: 7499,
      images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600"],
      featured: true,
      categorySlug: "electronics",
      variants: [
        { color: "Black", stock: 40, priceModifier: 0 },
        { color: "White", stock: 25, priceModifier: 500 },
      ],
    },

    // Clothing
    {
      name: "Premium Cotton T-Shirt",
      slug: "premium-cotton-t-shirt",
      description: "Soft, breathable 100% cotton t-shirt. Perfect for everyday wear with a relaxed fit.",
      price: 1299,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600",
      ],
      featured: true,
      categorySlug: "clothing",
      variants: [
        { color: "White", size: "S", stock: 30, priceModifier: 0 },
        { color: "White", size: "M", stock: 50, priceModifier: 0 },
        { color: "White", size: "L", stock: 40, priceModifier: 0 },
        { color: "White", size: "XL", stock: 25, priceModifier: 100 },
        { color: "Black", size: "S", stock: 30, priceModifier: 0 },
        { color: "Black", size: "M", stock: 50, priceModifier: 0 },
        { color: "Black", size: "L", stock: 40, priceModifier: 0 },
        { color: "Black", size: "XL", stock: 25, priceModifier: 100 },
        { color: "Navy", size: "M", stock: 35, priceModifier: 0 },
        { color: "Navy", size: "L", stock: 30, priceModifier: 0 },
      ],
    },
    {
      name: "Slim Fit Denim Jeans",
      slug: "slim-fit-denim-jeans",
      description: "Classic slim fit jeans made from premium stretch denim. Comfortable and stylish for any occasion.",
      price: 3499,
      images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"],
      featured: true,
      categorySlug: "clothing",
      variants: [
        { color: "Dark Blue", size: "30", stock: 20, priceModifier: 0 },
        { color: "Dark Blue", size: "32", stock: 35, priceModifier: 0 },
        { color: "Dark Blue", size: "34", stock: 30, priceModifier: 0 },
        { color: "Dark Blue", size: "36", stock: 20, priceModifier: 0 },
        { color: "Light Blue", size: "32", stock: 25, priceModifier: 0 },
        { color: "Light Blue", size: "34", stock: 20, priceModifier: 0 },
        { color: "Black", size: "32", stock: 30, priceModifier: 200 },
        { color: "Black", size: "34", stock: 25, priceModifier: 200 },
      ],
    },
    {
      name: "Casual Hoodie Sweatshirt",
      slug: "casual-hoodie-sweatshirt",
      description: "Warm and cozy hoodie with kangaroo pocket. Perfect for casual outings and lounging.",
      price: 2799,
      images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600"],
      featured: false,
      categorySlug: "clothing",
      variants: [
        { color: "Gray", size: "M", stock: 40, priceModifier: 0 },
        { color: "Gray", size: "L", stock: 35, priceModifier: 0 },
        { color: "Gray", size: "XL", stock: 25, priceModifier: 200 },
        { color: "Black", size: "M", stock: 40, priceModifier: 0 },
        { color: "Black", size: "L", stock: 35, priceModifier: 0 },
      ],
    },

    // Home & Garden
    {
      name: "Ceramic Plant Pot Set",
      slug: "ceramic-plant-pot-set",
      description: "Set of 3 minimalist ceramic plant pots in different sizes. Perfect for indoor plants and succulents.",
      price: 2499,
      images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600"],
      featured: true,
      categorySlug: "home-garden",
      variants: [
        { color: "White", stock: 30, priceModifier: 0 },
        { color: "Terracotta", stock: 25, priceModifier: 200 },
        { color: "Gray", stock: 20, priceModifier: 0 },
      ],
    },
    {
      name: "LED Desk Lamp with USB Charger",
      slug: "led-desk-lamp-usb-charger",
      description: "Modern LED desk lamp with adjustable brightness, color temperature, and built-in USB charging port.",
      price: 3999,
      images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"],
      featured: false,
      categorySlug: "home-garden",
      variants: [
        { color: "Black", stock: 45, priceModifier: 0 },
        { color: "White", stock: 40, priceModifier: 0 },
      ],
    },
    {
      name: "Decorative Throw Pillows",
      slug: "decorative-throw-pillows",
      description: "Set of 2 premium decorative pillows with removable covers. Adds style and comfort to any room.",
      price: 1999,
      images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"],
      featured: false,
      categorySlug: "home-garden",
      variants: [
        { color: "Blue Pattern", stock: 30, priceModifier: 0 },
        { color: "Gray Pattern", stock: 35, priceModifier: 0 },
        { color: "Beige Pattern", stock: 25, priceModifier: 0 },
      ],
    },

    // Sports & Fitness
    {
      name: "Yoga Mat Premium",
      slug: "yoga-mat-premium",
      description: "Extra thick 6mm yoga mat with non-slip surface. Includes carrying strap.",
      price: 2499,
      images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600"],
      featured: true,
      categorySlug: "sports-fitness",
      variants: [
        { color: "Purple", stock: 40, priceModifier: 0 },
        { color: "Blue", stock: 35, priceModifier: 0 },
        { color: "Black", stock: 50, priceModifier: 0 },
        { color: "Pink", stock: 25, priceModifier: 0 },
      ],
    },
    {
      name: "Adjustable Dumbbell Set",
      slug: "adjustable-dumbbell-set",
      description: "Space-saving adjustable dumbbells from 2.5kg to 25kg. Perfect for home workouts.",
      price: 12999,
      images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"],
      featured: true,
      categorySlug: "sports-fitness",
      variants: [{ color: "Black/Gray", stock: 20, priceModifier: 0 }],
    },
    {
      name: "Running Shoes Sport Pro",
      slug: "running-shoes-sport-pro",
      description: "Lightweight running shoes with responsive cushioning and breathable mesh upper.",
      price: 6999,
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
      featured: false,
      categorySlug: "sports-fitness",
      variants: [
        { color: "Black/White", size: "40", stock: 15, priceModifier: 0 },
        { color: "Black/White", size: "41", stock: 20, priceModifier: 0 },
        { color: "Black/White", size: "42", stock: 25, priceModifier: 0 },
        { color: "Black/White", size: "43", stock: 20, priceModifier: 0 },
        { color: "Black/White", size: "44", stock: 15, priceModifier: 0 },
        { color: "Blue/Orange", size: "41", stock: 15, priceModifier: 500 },
        { color: "Blue/Orange", size: "42", stock: 20, priceModifier: 500 },
        { color: "Blue/Orange", size: "43", stock: 15, priceModifier: 500 },
      ],
    },

    // Books & Stationery
    {
      name: "Premium Leather Notebook",
      slug: "premium-leather-notebook",
      description: "A5 size leather-bound notebook with 200 pages of premium paper. Perfect for journaling.",
      price: 1499,
      images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=600"],
      featured: false,
      categorySlug: "books-stationery",
      variants: [
        { color: "Brown", stock: 50, priceModifier: 0 },
        { color: "Black", stock: 45, priceModifier: 0 },
        { color: "Navy", stock: 30, priceModifier: 200 },
      ],
    },
    {
      name: "Professional Art Pencil Set",
      slug: "professional-art-pencil-set",
      description: "Set of 24 professional grade drawing pencils with varying hardness. Includes eraser and sharpener.",
      price: 1999,
      images: ["https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600"],
      featured: true,
      categorySlug: "books-stationery",
      variants: [{ stock: 60, priceModifier: 0 }],
    },

    // Beauty & Health
    {
      name: "Organic Face Serum",
      slug: "organic-face-serum",
      description: "Natural vitamin C serum for brightening and anti-aging. Suitable for all skin types.",
      price: 2999,
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"],
      featured: true,
      categorySlug: "beauty-health",
      variants: [
        { size: "30ml", stock: 40, priceModifier: 0 },
        { size: "50ml", stock: 30, priceModifier: 1000 },
      ],
    },
    {
      name: "Hair Care Gift Set",
      slug: "hair-care-gift-set",
      description: "Complete hair care set with shampoo, conditioner, and hair mask. Paraben-free formula.",
      price: 3999,
      images: ["https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600"],
      featured: false,
      categorySlug: "beauty-health",
      variants: [{ stock: 35, priceModifier: 0 }],
    },
    {
      name: "Electric Toothbrush Pro",
      slug: "electric-toothbrush-pro",
      description: "Sonic electric toothbrush with 5 cleaning modes and 2-minute timer. Includes 3 brush heads.",
      price: 4499,
      images: ["https://images.unsplash.com/photo-1559650656-5d1d361ad10e?w=600"],
      featured: false,
      categorySlug: "beauty-health",
      variants: [
        { color: "White", stock: 30, priceModifier: 0 },
        { color: "Black", stock: 25, priceModifier: 0 },
        { color: "Rose Gold", stock: 15, priceModifier: 500 },
      ],
    },
  ]

  for (const product of products) {
    const { categorySlug, variants, ...productData } = product
    const category = createdCategories[categorySlug]

    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        categoryId: category.id,
        variants: {
          create: variants.map((v) => ({
            size: v.size || null,
            color: v.color || null,
            stock: v.stock,
            priceModifier: v.priceModifier,
          })),
        },
      },
    })
    console.log("Product created:", created.name)
  }

  // Create payment settings
  await prisma.paymentSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      bankTransferEnabled: true,
      codEnabled: true,
      bankName: "HBL (Habib Bank Limited)",
      accountTitle: "Zenixa Store",
      accountNumber: "1234567890123",
      iban: "PK36HABB0001234567890123",
      bankInstructions: "Please include your order number as reference when making the transfer. Your order will be processed once payment is confirmed.",
    },
  })
  console.log("Payment settings created")

  // Create sample orders
  const sampleProduct = await prisma.product.findFirst({
    include: { variants: true },
  })

  if (sampleProduct && sampleProduct.variants.length > 0) {
    const sampleOrders = [
      {
        orderNumber: "ZNX-SAMPLE-001",
        customerName: "Ahmed Khan",
        customerEmail: "ahmed@example.com",
        customerPhone: "+92 321 1234567",
        shippingAddress: "House 45, Street 12, F-7/2",
        city: "Islamabad",
        postalCode: "44000",
        subtotal: 8999,
        shipping: 0,
        total: 8999,
        paymentMethod: "COD" as const,
        status: "DELIVERED" as const,
        paymentStatus: "paid",
      },
      {
        orderNumber: "ZNX-SAMPLE-002",
        customerName: "Fatima Ali",
        customerEmail: "fatima@example.com",
        customerPhone: "+92 333 9876543",
        shippingAddress: "Apartment 12, DHA Phase 5",
        city: "Karachi",
        postalCode: "75500",
        subtotal: 15999,
        shipping: 250,
        total: 16249,
        paymentMethod: "BANK_TRANSFER" as const,
        status: "PROCESSING" as const,
        paymentStatus: "paid",
      },
      {
        orderNumber: "ZNX-SAMPLE-003",
        customerName: "Hassan Raza",
        customerEmail: "hassan@example.com",
        customerPhone: "+92 300 5555555",
        shippingAddress: "Office 7, Mall Road",
        city: "Lahore",
        postalCode: "54000",
        subtotal: 3499,
        shipping: 250,
        total: 3749,
        paymentMethod: "COD" as const,
        status: "PENDING" as const,
        paymentStatus: "pending",
      },
    ]

    for (const order of sampleOrders) {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: order.orderNumber },
      })

      if (!existingOrder) {
        await prisma.order.create({
          data: {
            ...order,
            items: {
              create: {
                productId: sampleProduct.id,
                variantId: sampleProduct.variants[0].id,
                quantity: 1,
                price: sampleProduct.price,
              },
            },
          },
        })
        console.log("Sample order created:", order.orderNumber)
      }
    }
  }

  console.log("Database seed completed!")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
