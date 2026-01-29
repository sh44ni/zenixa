import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RotateCcw } from "lucide-react"

// Default content if no policy exists in DB
const defaultContent = `## Return & Refund Policy

We want you to be completely satisfied with your purchase. If you're not happy, we're here to help.

### Return Eligibility

- Items can be returned within **7 days** of delivery
- Products must be unused and in original packaging
- Tags and labels must be attached
- Receipt or proof of purchase is required

### Non-Returnable Items

- Intimate apparel and undergarments
- Customized or personalized items
- Items marked as "Final Sale"
- Products with broken seals (cosmetics, skincare)

### How to Return

1. Contact our support team via WhatsApp or email
2. Receive your Return Authorization (RA) number
3. Pack the item securely in original packaging
4. Ship to our returns address (provided with RA)

### Refund Process

- Refunds are processed within 5-7 business days
- Original payment method will be credited
- Shipping charges are non-refundable
- Defective items receive full refund including shipping

### Exchange Policy

- Exchanges are subject to availability
- Size exchanges are free of charge
- Color exchanges processed as return + new order

For any questions, please contact our customer support.
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
            // List items (both - and numbered)
            if (line.match(/^[\-\d]\.\s/) || line.startsWith('- ')) {
                const text = line.replace(/^[\-\d]\.\s?/, '').replace(/^-\s?/, '')
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
            where: { slug: "return-policy" }
        })
        return policy
    } catch {
        return null
    }
}

export default async function ReturnPolicyPage() {
    const policy = await getPolicy()

    const title = policy?.title || "Return Policy"
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
                            <RotateCcw className="h-6 w-6 text-primary" />
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
