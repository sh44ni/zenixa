import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react"

interface FaqItem {
    id: string
    question: string
    answer: string
    category: string | null
    isActive: boolean
}

// Default FAQs if none in database
const defaultFaqs: Omit<FaqItem, "id" | "isActive">[] = [
    {
        question: "How do I track my order?",
        answer: "You can track your order using the tracking number sent to you via SMS/email. Visit our Order Tracking page and enter your order number and phone number to see the latest status.",
        category: "Orders"
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept Bank Transfer and Cash on Delivery (COD). For bank transfers, you'll receive our account details at checkout. COD is available for all orders within Pakistan.",
        category: "Payment"
    },
    {
        question: "How long does delivery take?",
        answer: "Delivery times vary by location: Major cities (Lahore, Karachi, Islamabad) take 2-3 business days, other cities take 3-5 days, and remote areas may take 5-7 days.",
        category: "Shipping"
    },
    {
        question: "Can I return or exchange my order?",
        answer: "Yes! Items can be returned within 7 days of delivery if unused and in original packaging. Contact our support team to initiate a return and receive your Return Authorization number.",
        category: "Returns"
    },
    {
        question: "Is there free shipping?",
        answer: "Yes, we offer free shipping on all orders over PKR 5,000. Standard shipping is PKR 200 for orders below this amount.",
        category: "Shipping"
    },
    {
        question: "How do I contact customer support?",
        answer: "You can reach us via WhatsApp at +92 300 1234567, email at support@zenixa.pk, or through our contact form. Our support team is available 9 AM - 9 PM daily.",
        category: "Support"
    }
]

async function getFaqs() {
    try {
        const faqs = await prisma.faqItem.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" }
        })
        return faqs
    } catch {
        return []
    }
}

// Group FAQs by category
function groupByCategory(faqs: (FaqItem | Omit<FaqItem, "id" | "isActive">)[]) {
    const grouped: Record<string, typeof faqs> = {}
    faqs.forEach(faq => {
        const cat = faq.category || "General"
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(faq)
    })
    return grouped
}

export default async function FaqPage() {
    const dbFaqs = await getFaqs()
    const faqs = dbFaqs.length > 0 ? dbFaqs : defaultFaqs
    const groupedFaqs = groupByCategory(faqs)
    const categories = Object.keys(groupedFaqs)

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
                            <HelpCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold font-display">
                                Frequently Asked Questions
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Find answers to common questions about orders, shipping, and more.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-10">
                <div className="max-w-3xl mx-auto space-y-8">
                    {categories.map(category => (
                        <div key={category}>
                            <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                {category}
                            </h2>
                            <div className="space-y-3">
                                {groupedFaqs[category].map((faq, index) => (
                                    <FaqAccordion
                                        key={`${'id' in faq ? faq.id : index}`}
                                        question={faq.question}
                                        answer={faq.answer}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Client component for accordion functionality
function FaqAccordion({ question, answer }: { question: string; answer: string }) {
    return (
        <details className="group bg-white rounded-xl border shadow-sm overflow-hidden">
            <summary className="flex items-center justify-between p-4 md:p-5 cursor-pointer list-none hover:bg-secondary/30 transition-colors">
                <span className="font-medium text-sm md:text-base pr-4">{question}</span>
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t bg-secondary/10">
                <p className="pt-4">{answer}</p>
            </div>
        </details>
    )
}
