export interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  address: string | null
  city: string | null
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  products?: Product[]
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null // Original price for sale display
  images: string[]
  featured: boolean
  category: Category
  categoryId: string
  variants: ProductVariant[]
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  name: string | null
  size: string | null
  color: string | null
  sku: string | null
  stock: number
  minStock: number
  price: number | null
  comparePrice: number | null
  priceModifier: number
  images: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  product: Product
  variant?: ProductVariant
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  postalCode: string | null
  items: OrderItem[]
  subtotal: number
  discount: number
  couponCode: string | null
  courier: string | null
  trackingId: string | null
  shipping: number
  total: number
  paymentMethod: 'BANK_TRANSFER' | 'COD'
  paymentStatus: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  product: Product
  productId: string
  variant?: ProductVariant
  variantId: string | null
  quantity: number
  price: number
  createdAt: Date
}

export interface PaymentSettings {
  id: string
  bankTransferEnabled: boolean
  codEnabled: boolean
  bankName: string | null
  accountTitle: string | null
  accountNumber: string | null
  iban: string | null
  bankInstructions: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CheckoutFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  postalCode: string
  paymentMethod: 'BANK_TRANSFER' | 'COD'
  notes?: string
}

export interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  startDate: string | Date | null
  endDate: string | Date | null
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}
