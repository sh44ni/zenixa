# Zenixa - E-commerce Platform

A complete MVP multi-product e-commerce store with an integrated admin panel, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Frontend Store
- **Homepage**: Hero section, featured products carousel, categories showcase, testimonials
- **Product Browsing**: Product grid with filters (category, price, search), individual product pages with image gallery and variants
- **Shopping Cart**: Full cart functionality with quantity controls
- **Checkout**: Multi-step checkout with Bank Transfer and COD payment options
- **User Accounts**: Registration, login, order history, profile management
- **Search**: Full-text product search

### Admin Panel (/admin)
- **Dashboard**: Sales overview, recent orders, low stock alerts
- **Product Management**: Create, edit, delete products with variants (size, color)
- **Category Management**: Create and manage product categories
- **Order Management**: View and update order status
- **Payment Settings**: Enable/disable payment methods, configure bank details

### Technical Features
- **Authentication**: Secure NextAuth.js authentication with role-based access
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand for cart management with persistence
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library
- **Responsive Design**: Mobile-first approach

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zenixa
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/zenixa?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
ADMIN_EMAIL="admin@zenixa.com"
ADMIN_PASSWORD="admin123"
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

### Admin Account
- Email: `admin@zenixa.com`
- Password: `admin123`

### Sample Customer Account
- Email: `customer@example.com`
- Password: `customer123`

## Project Structure

```
zenixa/
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── (store)/          # Store pages (home, products, cart, checkout)
│   ├── admin/            # Admin panel pages
│   └── api/              # API routes
├── components/
│   ├── admin/            # Admin-specific components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── store/            # Store components (ProductCard, etc.)
│   ├── providers/        # Context providers
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and seed
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## Payment Methods

The platform supports two payment methods configured for the Pakistani market:

1. **Cash on Delivery (COD)**: Customers pay upon delivery
2. **Bank Transfer**: Direct bank transfer with account details shown at checkout

Payment methods can be enabled/disabled from the admin panel.

## Currency

The platform uses **Pakistani Rupees (PKR)** as the default currency. The `formatPrice` utility function formats prices according to Pakistani locale.

## Sample Data

The seed script creates:
- 1 admin user
- 1 sample customer
- 6 product categories
- 18 sample products with variants
- Payment settings with bank details
- 3 sample orders for testing

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project on Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@zenixa.pk or open an issue on GitHub.
