"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Linkedin, MessageCircle, Globe, Mail, Phone, MapPin, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SocialLink {
  platform: string
  url: string
  label?: string
}

interface FooterProps {
  brandText?: string
  email?: string
  phone?: string
  address?: string
  socialLinks?: SocialLink[]
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  tiktok: Globe,
  other: Globe,
}

function FooterSection({
  title,
  children,
  defaultOpen = false
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      {/* Mobile: Collapsible */}
      <button
        className="md:hidden w-full flex items-center justify-between py-3 text-white font-semibold"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Desktop: Always visible heading */}
      <h3 className="hidden md:block text-white font-semibold mb-4">{title}</h3>

      {/* Content */}
      <div className={cn(
        "md:block overflow-hidden transition-all duration-300",
        isOpen ? "max-h-96 pb-4" : "max-h-0 md:max-h-none"
      )}>
        {children}
      </div>
    </div>
  )
}

export function Footer({
  brandText = "Your trusted destination for quality products at competitive prices. Shop with confidence at Zenixa.",
  email = "support@zenixa.club",
  phone = "+92 300 1234567",
  address = "Lahore, Pakistan",
  socialLinks = []
}: FooterProps) {
  // Default social links if none provided
  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : [
    { platform: "facebook", url: "#" },
    { platform: "instagram", url: "#" },
    { platform: "twitter", url: "#" },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-8">
          {/* Brand - Always visible */}
          <div className="space-y-4 py-4 md:py-0">
            <Link href="/" className="flex items-center">
              <img
                src="/logo-white.svg"
                alt="Zenixa"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              {brandText}
            </p>
            <div className="flex justify-center md:justify-start space-x-3 flex-wrap gap-y-2">
              {displaySocialLinks.map((link, index) => {
                const Icon = PLATFORM_ICONS[link.platform] || Globe
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-primary transition-colors"
                    aria-label={link.label || link.platform}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <FooterSection title="Quick Links">
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-primary transition-colors inline-block py-1">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors inline-block py-1">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="hover:text-primary transition-colors inline-block py-1">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary transition-colors inline-block py-1">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* Customer Service */}
          <FooterSection title="Customer Service">
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account/orders" className="hover:text-primary transition-colors inline-block py-1">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-primary transition-colors inline-block py-1">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-primary transition-colors inline-block py-1">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors inline-block py-1">
                  FAQ
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* Contact Info */}
          <FooterSection title="Contact Us" defaultOpen>
            <ul className="space-y-3 text-sm">
              {address && (
                <li className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </FooterSection>
        </div>

        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm">
          <p>&copy; {new Date().getFullYear()} Zenixa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
