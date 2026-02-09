"use client"

import { useState } from "react"
import {
  BookOpen, ChevronDown, ChevronRight, Copy, Check,
  ShoppingBag, FolderTree, ShoppingCart, CreditCard,
  Users, Boxes, TicketPercent, BarChart3, Settings,
  FileText, HelpCircle, Star, Truck, Webhook, KeyRound,
  ExternalLink
} from "lucide-react"

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  description: string
  auth: string
  params?: { name: string; type: string; required: boolean; description: string }[]
  body?: string
  response?: string
}

interface Section {
  title: string
  icon: any
  description: string
  endpoints: Endpoint[]
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
}

const STOREFRONT_SECTIONS: Section[] = [
  {
    title: "Products",
    icon: ShoppingBag,
    description: "Browse and search products for your storefront display.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/storefront/products",
        description: "List products with pagination, search, category filter, and sorting.",
        auth: "API Key",
        params: [
          { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
          { name: "per_page", type: "number", required: false, description: "Items per page (default: 20, max: 100)" },
          { name: "search", type: "string", required: false, description: "Search by product name or description" },
          { name: "category", type: "string", required: false, description: "Filter by category slug" },
          { name: "featured", type: "boolean", required: false, description: "Filter featured products only" },
          { name: "sort", type: "string", required: false, description: "Sort: newest, oldest, price_asc, price_desc, name_asc, name_desc" },
        ],
        response: `{
  "success": true,
  "data": [{
    "id": "clx...",
    "name": "Premium Leather Bag",
    "slug": "premium-leather-bag",
    "description": "Handcrafted genuine leather...",
    "price": 4500,
    "comparePrice": 6000,
    "images": ["https://..."],
    "featured": true,
    "category": { "id": "...", "name": "Bags", "slug": "bags" },
    "variants": [{
      "id": "...", "size": "M", "color": "Brown",
      "stock": 25, "price": null, "priceModifier": 0
    }],
    "reviewCount": 12,
    "averageRating": 4.5,
    "createdAt": "2026-01-15T..."
  }],
  "meta": { "page": 1, "perPage": 20, "total": 156, "totalPages": 8 }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/storefront/products/:slug",
        description: "Get full product details by slug, including reviews.",
        auth: "API Key",
        response: `{
  "success": true,
  "data": {
    "id": "...", "name": "...", "slug": "...",
    "price": 4500, "comparePrice": 6000,
    "images": ["..."], "description": "...",
    "category": { "id": "...", "name": "Bags", "slug": "bags" },
    "variants": [{ "id": "...", "size": "M", "color": "Brown", "stock": 25 }],
    "reviews": [{
      "id": "...", "rating": 5, "title": "Great!",
      "comment": "Love it", "userName": "John", "createdAt": "..."
    }],
    "reviewCount": 12, "averageRating": 4.5
  }
}`,
      },
    ],
  },
  {
    title: "Categories",
    icon: FolderTree,
    description: "Browse product categories.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/storefront/categories",
        description: "List all categories with product counts.",
        auth: "API Key",
        response: `{
  "success": true,
  "data": [{
    "id": "...", "name": "Electronics", "slug": "electronics",
    "description": "...", "image": "https://...", "productCount": 45
  }]
}`,
      },
      {
        method: "GET",
        path: "/api/v1/storefront/categories/:slug",
        description: "Get a category with its paginated products.",
        auth: "API Key",
        params: [
          { name: "page", type: "number", required: false, description: "Page number" },
          { name: "per_page", type: "number", required: false, description: "Items per page" },
          { name: "sort", type: "string", required: false, description: "Sort order" },
        ],
      },
    ],
  },
  {
    title: "Cart & Checkout",
    icon: ShoppingCart,
    description: "Validate cart items, apply coupons, and create orders.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/storefront/cart/validate",
        description: "Validate cart items against current stock and prices before checkout.",
        auth: "API Key",
        body: `{
  "items": [
    { "productId": "xxx", "variantId": "yyy", "quantity": 2 }
  ]
}`,
        response: `{
  "success": true,
  "data": {
    "items": [{
      "productId": "xxx", "productName": "Bag", "variantId": "yyy",
      "variantLabel": "M / Brown", "requestedQuantity": 2,
      "availableStock": 25, "available": true,
      "unitPrice": 4500, "lineTotal": 9000
    }],
    "subtotal": 9000, "itemCount": 2, "allAvailable": true
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/storefront/checkout/validate-coupon",
        description: "Validate a coupon code and calculate the discount.",
        auth: "API Key",
        params: [
          { name: "code", type: "string", required: true, description: "Coupon code" },
          { name: "subtotal", type: "number", required: true, description: "Current cart subtotal" },
        ],
        response: `{
  "success": true,
  "data": {
    "valid": true, "code": "SAVE10", "type": "PERCENTAGE",
    "value": 10, "discount": 900, "newSubtotal": 8100
  }
}`,
      },
      {
        method: "POST",
        path: "/api/v1/storefront/checkout",
        description: "Place an order. Validates stock, applies coupon, calculates shipping.",
        auth: "API Key",
        body: `{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+923001234567"
  },
  "shipping": {
    "address": "123 Main Street",
    "city": "Lahore",
    "postalCode": "54000"
  },
  "items": [
    { "productId": "xxx", "variantId": "yyy", "quantity": 2 }
  ],
  "paymentMethod": "COD",
  "couponCode": "SAVE10",
  "notes": "Please leave at door",
  "userId": "optional_user_id"
}`,
        response: `{
  "success": true,
  "data": {
    "orderNumber": "ZNX-1707...-ABCD",
    "status": "PENDING",
    "subtotal": 9000, "discount": 900,
    "shipping": 0, "total": 8100,
    "paymentMethod": "COD",
    "items": [...], "createdAt": "..."
  }
}`,
      },
    ],
  },
  {
    title: "Order Tracking",
    icon: Truck,
    description: "Track orders by order number and email.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/storefront/tracking",
        description: "Track an order by order number and customer email.",
        auth: "API Key",
        params: [
          { name: "order_number", type: "string", required: true, description: "Order number (e.g., ZNX-...)" },
          { name: "email", type: "string", required: true, description: "Customer email" },
        ],
        response: `{
  "success": true,
  "data": {
    "orderNumber": "ZNX-...", "status": "SHIPPED",
    "courier": "TCS", "trackingId": "TCS123456",
    "total": 8100, "items": [...],
    "shippingAddress": "123 Main St", "city": "Lahore"
  }
}`,
      },
    ],
  },
  {
    title: "Reviews",
    icon: Star,
    description: "Get and submit product reviews.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/storefront/reviews/:productId",
        description: "Get paginated reviews for a product with rating summary.",
        auth: "API Key",
        params: [
          { name: "page", type: "number", required: false, description: "Page number" },
          { name: "per_page", type: "number", required: false, description: "Reviews per page (max: 50)" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/storefront/reviews/:productId",
        description: "Submit a review for a product (one per user per product).",
        auth: "API Key",
        body: `{
  "userId": "user_id",
  "rating": 5,
  "title": "Great product!",
  "comment": "Really loved the quality."
}`,
      },
    ],
  },
  {
    title: "Store Settings",
    icon: Settings,
    description: "Get storefront configuration (theme, hero, delivery, footer, payment).",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/storefront/settings",
        description: "Get all storefront-facing settings in one call.",
        auth: "API Key",
        response: `{
  "success": true,
  "data": {
    "hero": { "mode": "slider", "sliderImages": [...], "title": "...", ... },
    "theme": { "primaryColor": "221.2 83.2% 53.3%", ... },
    "delivery": { "charges": 250, "freeDeliveryThreshold": 5000, ... },
    "payment": { "codEnabled": true, "bankTransferEnabled": true, ... },
    "footer": { "brandText": "...", "email": "...", "socialLinks": [...] },
    "productBadges": { ... },
    "featureBadges": [...],
    "ctaBanner": { "image": "...", "title": "...", "subtitle": "...", "buttonText": "...", "link": "..." },
    "promoBanner": { "enabled": true, "image": "...", "link": "...", "width": 1200, "height": 300 }
  }
}`,
      },
    ],
  },
  {
    title: "Pages & FAQ",
    icon: FileText,
    description: "Get policy pages and FAQ content.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/storefront/pages/:slug",
        description: "Get a policy page by slug (e.g., 'shipping-policy', 'return-policy').",
        auth: "API Key",
      },
      {
        method: "GET",
        path: "/api/v1/storefront/faq",
        description: "Get all active FAQ items, grouped by category.",
        auth: "API Key",
        params: [
          { name: "category", type: "string", required: false, description: "Filter by FAQ category" },
        ],
      },
    ],
  },
]

const ADMIN_SECTIONS: Section[] = [
  {
    title: "Products",
    icon: ShoppingBag,
    description: "Full CRUD management of products and variants.",
    endpoints: [
      { method: "GET", path: "/api/v1/admin/products", description: "List all products (paginated).", auth: "products:read",
        params: [
          { name: "page", type: "number", required: false, description: "Page number" },
          { name: "per_page", type: "number", required: false, description: "Items per page" },
          { name: "search", type: "string", required: false, description: "Search by name/slug" },
          { name: "category", type: "string", required: false, description: "Filter by category ID" },
          { name: "featured", type: "boolean", required: false, description: "Filter featured" },
        ],
      },
      { method: "POST", path: "/api/v1/admin/products", description: "Create a product with variants.", auth: "products:write",
        body: `{
  "name": "Product Name", "price": 1500,
  "categoryId": "cat_id", "description": "...",
  "images": ["url"], "featured": false,
  "variants": [{ "size": "M", "color": "Red", "stock": 50, "sku": "SKU-001" }]
}`,
      },
      { method: "GET", path: "/api/v1/admin/products/:id", description: "Get a single product.", auth: "products:read" },
      { method: "PUT", path: "/api/v1/admin/products/:id", description: "Update a product (replaces variants).", auth: "products:write" },
      { method: "DELETE", path: "/api/v1/admin/products/:id", description: "Delete a product.", auth: "products:delete" },
    ],
  },
  {
    title: "Categories",
    icon: FolderTree,
    description: "Manage product categories.",
    endpoints: [
      { method: "GET", path: "/api/v1/admin/categories", description: "List all categories with product counts.", auth: "categories:read" },
      { method: "POST", path: "/api/v1/admin/categories", description: "Create a category.", auth: "categories:write",
        body: `{ "name": "Electronics", "slug": "electronics", "description": "...", "image": "url" }` },
      { method: "PUT", path: "/api/v1/admin/categories/:id", description: "Update a category.", auth: "categories:write" },
      { method: "DELETE", path: "/api/v1/admin/categories/:id", description: "Delete a category (must have no products).", auth: "categories:delete" },
    ],
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    description: "View and manage customer orders.",
    endpoints: [
      { method: "GET", path: "/api/v1/admin/orders", description: "List orders (paginated, filterable by status).", auth: "orders:read",
        params: [
          { name: "status", type: "string", required: false, description: "PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED" },
          { name: "search", type: "string", required: false, description: "Search by order number or customer" },
          { name: "sort", type: "string", required: false, description: "newest, oldest, total_asc, total_desc" },
        ],
      },
      { method: "GET", path: "/api/v1/admin/orders/:id", description: "Get full order details.", auth: "orders:read" },
      { method: "PATCH", path: "/api/v1/admin/orders/:id", description: "Update order status, tracking, payment status.", auth: "orders:write",
        body: `{
  "status": "SHIPPED",
  "courier": "TCS",
  "trackingId": "TCS123456",
  "paymentStatus": "paid"
}` },
    ],
  },
  {
    title: "Customers",
    icon: Users,
    description: "View customer data and order history.",
    endpoints: [
      { method: "GET", path: "/api/v1/admin/customers", description: "List customers (paginated, searchable).", auth: "customers:read",
        params: [
          { name: "search", type: "string", required: false, description: "Search by name, email, phone" },
          { name: "sort", type: "string", required: false, description: "newest, name, orders, spent" },
        ],
      },
      { method: "GET", path: "/api/v1/admin/customers/:id", description: "Get customer profile with orders, addresses, reviews.", auth: "customers:read" },
    ],
  },
  {
    title: "Inventory",
    icon: Boxes,
    description: "Monitor and update stock levels.",
    endpoints: [
      { method: "GET", path: "/api/v1/admin/inventory", description: "View all product variant stock levels.", auth: "inventory:read",
        params: [
          { name: "filter", type: "string", required: false, description: "all, low, out" },
          { name: "search", type: "string", required: false, description: "Search by product name" },
        ],
      },
      { method: "PATCH", path: "/api/v1/admin/inventory", description: "Bulk update stock levels.", auth: "inventory:write",
        body: `{
  "updates": [
    { "variantId": "xxx", "stock": 100, "minStock": 10 }
  ]
}` },
    ],
  },
  {
    title: "Coupons",
    icon: TicketPercent,
    description: "Manage discount coupons.",
    endpoints: [
      { method: "GET", path: "/api/v1/admin/coupons", description: "List all coupons.", auth: "coupons:read" },
      { method: "POST", path: "/api/v1/admin/coupons", description: "Create a coupon.", auth: "coupons:write",
        body: `{ "code": "SAVE10", "type": "PERCENTAGE", "value": 10, "usageLimit": 100 }` },
      { method: "PATCH", path: "/api/v1/admin/coupons/:id", description: "Update a coupon.", auth: "coupons:write" },
      { method: "DELETE", path: "/api/v1/admin/coupons/:id", description: "Delete a coupon.", auth: "coupons:delete" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    description: "Dashboard analytics and reporting.",
    endpoints: [
      { method: "GET", path: "/api/v1/admin/analytics", description: "Get comprehensive analytics: revenue, orders, trends, top products.", auth: "analytics:read" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    description: "Manage all site and payment settings.",
    endpoints: [
      { method: "GET", path: "/api/v1/admin/settings", description: "Get all settings (site, payment, policies).", auth: "settings:read" },
      { method: "PUT", path: "/api/v1/admin/settings", description: "Update settings. Send { site: {...}, payment: {...} }.", auth: "settings:write" },
    ],
  },
]

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyPath() {
    navigator.clipboard.writeText(endpoint.path)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${METHOD_COLORS[endpoint.method]}`}>
          {endpoint.method}
        </span>
        <code className="text-sm font-medium text-gray-800 flex-1">{endpoint.path}</code>
        <span className="text-xs text-gray-400 hidden sm:block">{endpoint.auth}</span>
        {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t bg-gray-50 p-4 space-y-3">
          <p className="text-sm text-gray-600">{endpoint.description}</p>

          <div className="flex items-center gap-2">
            <code className="text-xs bg-white px-2 py-1 rounded border">{endpoint.path}</code>
            <button onClick={copyPath} className="text-gray-400 hover:text-gray-600">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {endpoint.params && endpoint.params.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Query Parameters</h4>
              <div className="space-y-1">
                {endpoint.params.map((p) => (
                  <div key={p.name} className="flex items-start gap-2 text-sm">
                    <code className="bg-white px-1.5 py-0.5 rounded border text-xs shrink-0">
                      {p.name}
                    </code>
                    <span className="text-xs text-gray-400">{p.type}</span>
                    {p.required && <span className="text-xs text-red-500">required</span>}
                    <span className="text-xs text-gray-500">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.body && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Request Body</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
                {endpoint.body}
              </pre>
            </div>
          )}

          {endpoint.response && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Response Example</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
                {endpoint.response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionBlock({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = section.icon

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <Icon className="h-5 w-5 text-blue-600 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{section.title}</h3>
          <p className="text-sm text-gray-500">{section.description}</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {section.endpoints.length} endpoint{section.endpoints.length !== 1 ? "s" : ""}
        </span>
        {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t p-4 space-y-2">
          {section.endpoints.map((ep, i) => (
            <EndpointCard key={i} endpoint={ep} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<"storefront" | "admin" | "guide">("guide")
  const [copied, setCopied] = useState(false)

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          API Documentation
        </h1>
        <p className="text-gray-500 mt-1">
          Complete REST API reference for connecting any storefront to your Zenixa admin panel.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { key: "guide", label: "Quick Start Guide" },
          { key: "storefront", label: "Storefront API" },
          { key: "admin", label: "Admin API" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Start Guide */}
      {activeTab === "guide" && (
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
              Create an API Key
            </h2>
            <p className="text-gray-600">
              Go to <strong>API & Webhooks</strong> in the admin sidebar and create a new API key.
              Save it securely - it&apos;s only shown once.
            </p>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`Your key will look like: znx_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
              Authenticate Your Requests
            </h2>
            <p className="text-gray-600">
              Include your API key in every request using one of these methods:
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Option A: X-API-Key Header (Recommended)</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`fetch("https://yoursite.com/api/v1/storefront/products", {
  headers: {
    "X-API-Key": "znx_your_api_key_here"
  }
})`}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Option B: Authorization Bearer Header</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`fetch("https://yoursite.com/api/v1/storefront/products", {
  headers: {
    "Authorization": "Bearer znx_your_api_key_here"
  }
})`}
                </pre>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
              Response Format
            </h2>
            <p className="text-gray-600">
              All API responses follow a consistent JSON format:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-1">Success Response</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "success": true,
  "data": { ... },
  "meta": {           // Only on paginated
    "page": 1,
    "perPage": 20,
    "total": 156,
    "totalPages": 8
  }
}`}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-1">Error Response</h4>
                <pre className="bg-gray-900 text-red-400 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key."
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span>
              Quick Examples
            </h2>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Fetch Products (Next.js / React)</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`const API_KEY = process.env.ZENIXA_API_KEY;
const BASE_URL = "https://your-zenixa-admin.com";

// Get all products
const res = await fetch(\`\${BASE_URL}/api/v1/storefront/products?per_page=12\`, {
  headers: { "X-API-Key": API_KEY }
});
const { data: products, meta } = await res.json();

// Get single product
const res2 = await fetch(\`\${BASE_URL}/api/v1/storefront/products/premium-bag\`, {
  headers: { "X-API-Key": API_KEY }
});
const { data: product } = await res2.json();`}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Place an Order</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`const order = await fetch(\`\${BASE_URL}/api/v1/storefront/checkout\`, {
  method: "POST",
  headers: {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    customer: { name: "John", email: "john@mail.com", phone: "+923001234567" },
    shipping: { address: "123 Main St", city: "Lahore" },
    items: [{ productId: "xxx", variantId: "yyy", quantity: 1 }],
    paymentMethod: "COD"
  })
});
const { data } = await order.json();
console.log("Order placed:", data.orderNumber);`}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Handle Webhooks (Express.js)</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`import crypto from "crypto";

app.post("/webhooks/zenixa", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const event = req.headers["x-webhook-event"];
  const body = JSON.stringify(req.body);

  // Verify signature
  const expected = "sha256=" + crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return res.status(401).send("Invalid signature");
  }

  // Handle event
  switch (event) {
    case "order.created":
      console.log("New order:", req.body.data);
      break;
    case "inventory.low":
      console.log("Low stock alert:", req.body.data);
      break;
  }

  res.status(200).send("OK");
});`}
                </pre>
              </div>
            </div>
          </div>

          {/* Permissions Reference */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600" />
              Permissions Reference
            </h2>
            <p className="text-sm text-gray-600">
              Assign granular permissions to each API key. Use <code className="bg-gray-100 px-1.5 rounded">*</code> for full access.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { perm: "*", desc: "Full access to all resources" },
                { perm: "products:read", desc: "View products" },
                { perm: "products:write", desc: "Create/update products" },
                { perm: "products:delete", desc: "Delete products" },
                { perm: "categories:read", desc: "View categories" },
                { perm: "categories:write", desc: "Create/update categories" },
                { perm: "categories:delete", desc: "Delete categories" },
                { perm: "orders:read", desc: "View orders" },
                { perm: "orders:write", desc: "Update order status" },
                { perm: "customers:read", desc: "View customer data" },
                { perm: "inventory:read", desc: "View stock levels" },
                { perm: "inventory:write", desc: "Update stock levels" },
                { perm: "coupons:read", desc: "View coupons" },
                { perm: "coupons:write", desc: "Create/update coupons" },
                { perm: "coupons:delete", desc: "Delete coupons" },
                { perm: "analytics:read", desc: "View analytics" },
                { perm: "settings:read", desc: "View settings" },
                { perm: "settings:write", desc: "Update settings" },
              ].map(({ perm, desc }) => (
                <div key={perm} className="flex items-start gap-2 p-2 rounded border bg-gray-50">
                  <code className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded shrink-0">{perm}</code>
                  <span className="text-xs text-gray-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Events */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Webhook className="h-5 w-5 text-purple-600" />
              Webhook Events
            </h2>
            <p className="text-sm text-gray-600">
              Subscribe to specific events to get real-time notifications on your storefront.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { event: "order.created", desc: "New order placed" },
                { event: "order.updated", desc: "Order details modified" },
                { event: "order.status_changed", desc: "Order status changed" },
                { event: "order.cancelled", desc: "Order was cancelled" },
                { event: "product.created", desc: "New product added" },
                { event: "product.updated", desc: "Product details changed" },
                { event: "product.deleted", desc: "Product was deleted" },
                { event: "inventory.updated", desc: "Stock levels changed" },
                { event: "inventory.low", desc: "Stock below minimum threshold" },
                { event: "category.created", desc: "New category added" },
                { event: "category.updated", desc: "Category modified" },
                { event: "category.deleted", desc: "Category was deleted" },
                { event: "coupon.created", desc: "New coupon created" },
                { event: "coupon.updated", desc: "Coupon modified" },
                { event: "coupon.deleted", desc: "Coupon was deleted" },
                { event: "settings.updated", desc: "Site settings changed" },
              ].map(({ event, desc }) => (
                <div key={event} className="flex items-start gap-2 p-2 rounded border bg-gray-50">
                  <code className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded shrink-0">{event}</code>
                  <span className="text-xs text-gray-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Codes */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Error Codes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">HTTP Status</th>
                    <th className="pb-2 font-medium">Code</th>
                    <th className="pb-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { status: "401", code: "UNAUTHORIZED", desc: "Missing or invalid API key" },
                    { status: "403", code: "FORBIDDEN", desc: "API key lacks required permission" },
                    { status: "404", code: "NOT_FOUND", desc: "Requested resource does not exist" },
                    { status: "409", code: "CONFLICT", desc: "Resource already exists (duplicate slug, code, etc.)" },
                    { status: "422", code: "VALIDATION_ERROR", desc: "Request body failed validation" },
                    { status: "429", code: "RATE_LIMITED", desc: "Too many requests" },
                    { status: "500", code: "INTERNAL_ERROR", desc: "Unexpected server error" },
                  ].map(({ status, code, desc }) => (
                    <tr key={code}>
                      <td className="py-2"><code className="text-xs bg-gray-100 px-1.5 rounded">{status}</code></td>
                      <td className="py-2"><code className="text-xs bg-red-50 text-red-700 px-1.5 rounded">{code}</code></td>
                      <td className="py-2 text-gray-600">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Storefront API */}
      {activeTab === "storefront" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Storefront API</strong> endpoints are designed for public-facing storefronts.
              They return data formatted for display (with computed fields like average rating, stock availability, etc.)
              All endpoints require an API key.
            </p>
          </div>
          {STOREFRONT_SECTIONS.map((section) => (
            <SectionBlock key={section.title} section={section} />
          ))}
        </div>
      )}

      {/* Admin API */}
      {activeTab === "admin" && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-sm text-orange-800">
              <strong>Admin API</strong> endpoints provide full CRUD access for managing your store.
              Each endpoint requires specific permissions (shown per endpoint).
              Use <code className="bg-orange-100 px-1 rounded">*</code> permission for full access.
            </p>
          </div>
          {ADMIN_SECTIONS.map((section) => (
            <SectionBlock key={section.title} section={section} />
          ))}
        </div>
      )}
    </div>
  )
}
