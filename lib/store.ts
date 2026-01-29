import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, ProductVariant } from '@/types'

export interface CartItem {
  id: string
  product: Product
  variant?: ProductVariant
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, variant?: ProductVariant, quantity = 1) => {
        const items = get().items
        const itemId = variant ? `${product.id}-${variant.id}` : product.id

        // Check available stock
        const availableStock = variant?.stock ?? product.variants[0]?.stock ?? 0
        const existingItem = items.find(item => item.id === itemId)
        const currentQty = existingItem?.quantity || 0
        const newQty = currentQty + quantity

        // Validate stock availability
        if (newQty > availableStock) {
          // Return without adding - stock exceeded
          console.warn(`Cannot add ${quantity} items. Only ${availableStock - currentQty} available.`)
          return
        }

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === itemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          set({
            items: [...items, { id: itemId, product, variant, quantity }]
          })
        }
      },

      removeItem: (itemId: string) => {
        set({
          items: get().items.filter(item => item.id !== itemId)
        })
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set({
          items: get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price + (item.variant?.priceModifier || 0)
          return total + price * item.quantity
        }, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'zenixa-cart',
    }
  )
)
