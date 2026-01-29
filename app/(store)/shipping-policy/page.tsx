import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Truck } from "lucide-react"

// Default content if no policy exists in DB
const defaultContent = `## Shipping Information

We are committed to delivering your orders quickly and safely.

### Delivery Times

- **Lahore, Karachi, Islamabad**: 2-3 business days
- **Other major cities**: 3-5 business days  
- **Remote areas**: 5-7 business days

### Shipping Charges

- **Free Shipping** on orders over PKR 5,000
- Standard shipping: PKR 200
- Express shipping: PKR 350

### Order Processing

- Orders placed before 2 PM are processed the same day
- You will receive a tracking number via SMS/email once shipped
- Track your order anytime using our Order Tracking page

### Important Notes

- Delivery times may vary during peak seasons or holidays
- We currently ship within Pakistan only
- A valid phone number is required for delivery coordination

For any shipping inquiries, please contact our support team.
`

// Simple markdown to HTML converter
function markdownToHtml(content: string): string {
    return content
        .split('\n')
        .map(line => {
            // Headers
            if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`
            if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
            if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`
            // List items
            if (line.startsWith('- ')) {
                const text = line.slice(2)
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                return `<li>${text}</li>`
            }
            // Empty lines
            if (line.trim() === '') return ''
            // Regular paragraphs
            const text = line
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
            return `<p>${text}</p>`
        })
        .join('\n')
        // Wrap consecutive li elements in ul
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc pl-6 space-y-1 my-4">$&</ul>')
}

async function getPolicy() {
    try {
        const policy = await prisma.policyPage.findUnique({
            where: { slug: "shipping-policy" }
        })
        return policy
    } catch {
        return null
    }
}

export default async function ShippingPolicyPage() {
    const policy = await getPolicy()

    // Use database content or default
    const title = policy?.title || "Shipping Policy"
    const content = policy?.content || defaultContent
    const isActive = policy?.isActive ?? true

    if (policy && !isActive) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
                <div className="container mx-auto px-4 py-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Truck className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-display">{title}</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-10">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-10">
                        <div
                            className="prose prose-gray max-w-none
                                prose-headings:font-display prose-headings:font-bold
                                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-3
                                prose-li:text-muted-foreground
                                prose-strong:text-foreground
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
