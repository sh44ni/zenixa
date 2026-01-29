const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultFaqs = [
    { question: 'How do I track my order?', answer: 'You can track your order using the tracking number sent to you via SMS/email. Visit our Order Tracking page and enter your order number and phone number to see the latest status.', category: 'Orders', order: 0 },
    { question: 'What payment methods do you accept?', answer: 'We accept Bank Transfer and Cash on Delivery (COD). For bank transfers, you will receive our account details at checkout. COD is available for all orders within Pakistan.', category: 'Payment', order: 1 },
    { question: 'How long does delivery take?', answer: 'Delivery times vary by location: Major cities (Lahore, Karachi, Islamabad) take 2-3 business days, other cities take 3-5 days, and remote areas may take 5-7 days.', category: 'Shipping', order: 2 },
    { question: 'Can I return or exchange my order?', answer: 'Yes! Items can be returned within 7 days of delivery if unused and in original packaging. Contact our support team to initiate a return and receive your Return Authorization number.', category: 'Returns', order: 3 },
    { question: 'Is there free shipping?', answer: 'Yes, we offer free shipping on all orders over PKR 5,000. Standard shipping is PKR 200 for orders below this amount.', category: 'Shipping', order: 4 },
    { question: 'How do I contact customer support?', answer: 'You can reach us via WhatsApp at +92 300 1234567, email at support@zenixa.pk, or through our contact form. Our support team is available 9 AM - 9 PM daily.', category: 'Support', order: 5 }
];

async function seed() {
    try {
        const count = await prisma.faqItem.count();
        if (count === 0) {
            for (const faq of defaultFaqs) {
                await prisma.faqItem.create({ data: { ...faq, isActive: true } });
            }
            console.log('Seeded ' + defaultFaqs.length + ' FAQ items');
        } else {
            console.log('FAQ items already exist: ' + count);
        }
    } catch (error) {
        console.error('Error seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
