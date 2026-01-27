import Link from "next/link"
import { Metadata } from "next"
import {
  Check,
  X,
  Zap,
  Shield,
  Smartphone,
  CreditCard,
  BarChart3,
  Package,
  Globe,
  Clock,
  HeartHandshake,
  ArrowRight,
  Star,
  ChevronDown,
  Sparkles,
  Rocket,
  Code2,
  Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Zenixa - The E-commerce Platform You Actually Own",
  description: "Launch your online store with a one-time payment. No monthly fees, no revenue cuts. Beautiful, mobile-first design that you control completely.",
  keywords: ["ecommerce platform", "shopify alternative", "one-time payment", "online store builder", "self-hosted ecommerce"],
}

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Zenixa</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#comparison" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Compare</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">FAQ</a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/store">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  View Demo
                </Button>
              </Link>
              <Link href="#pricing">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 blur-3xl opacity-60 animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/4 left-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-cyan-100 to-blue-100 blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 mb-8 animate-fadeInUp">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">The smarter way to sell online</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              Your Store,{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Rules
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Launch a beautiful e-commerce store with a{" "}
              <span className="font-semibold text-gray-900">one-time payment</span>.
              No monthly fees. No revenue cuts. Ever.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <Link href="#pricing">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 rounded-xl">
                  Start Selling Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/store">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-2 rounded-xl">
                  View Live Demo
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white" />
                  ))}
                </div>
                <span>500+ stores launched</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-16 md:mt-20 relative animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <div className="relative mx-auto max-w-5xl">
              {/* Browser Frame */}
              <div className="bg-gray-900 rounded-t-2xl p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-gray-800 rounded-lg px-4 py-1.5 text-gray-400 text-sm text-center">
                  yourstore.zenixa.com
                </div>
              </div>
              {/* Screenshot Placeholder */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-[16/9] rounded-b-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                      <Package className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-500 text-lg">Beautiful store dashboard preview</p>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -left-4 md:-left-8 top-1/4 bg-white rounded-xl shadow-xl p-4 hidden lg:block animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Order Received</p>
                    <p className="text-sm text-gray-500">Just now</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 md:-right-8 bottom-1/4 bg-white rounded-xl shadow-xl p-4 hidden lg:block animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">+127% Sales</p>
                    <p className="text-sm text-gray-500">This month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 mb-8">TRUSTED BY ENTREPRENEURS WORLDWIDE</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale">
            {['TechCorp', 'StyleCo', 'FoodMart', 'GadgetHub', 'FashionX'].map((brand) => (
              <div key={brand} className="text-2xl font-bold text-gray-400">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Powerful Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">succeed online</span>
            </h2>
            <p className="text-lg text-gray-600">
              Built with modern technology and designed for growth. No technical skills required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: CreditCard,
                title: "One-Time Payment",
                description: "Pay once, own forever. No monthly fees eating into your profits. Your store, your earnings.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Smartphone,
                title: "Mobile-First Design",
                description: "Stunning on every device. 70% of shoppers use mobile - your store will look perfect for them.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Built on Next.js for incredible speed. Fast stores convert 2x better than slow ones.",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Enterprise-grade security with SSL, secure payments, and data protection built-in.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Palette,
                title: "Beautiful by Default",
                description: "Professional designs that make your products shine. No design skills needed.",
                gradient: "from-pink-500 to-rose-500"
              },
              {
                icon: BarChart3,
                title: "Built-in Analytics",
                description: "Understand your customers with detailed analytics. Make data-driven decisions.",
                gradient: "from-indigo-500 to-purple-500"
              },
              {
                icon: Package,
                title: "Easy Management",
                description: "Intuitive admin panel to manage products, orders, and customers effortlessly.",
                gradient: "from-teal-500 to-green-500"
              },
              {
                icon: Globe,
                title: "SEO Optimized",
                description: "Rank higher on Google. Built-in SEO features help customers find your store.",
                gradient: "from-blue-600 to-indigo-600"
              },
              {
                icon: Code2,
                title: "Full Ownership",
                description: "Get the complete source code. Host anywhere, customize everything, no lock-in.",
                gradient: "from-gray-700 to-gray-900"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl p-6 md:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Smart Comparison</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Zenixa vs{" "}
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Shopify</span>
            </h2>
            <p className="text-lg text-gray-600">
              See why smart entrepreneurs are switching to Zenixa
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
                <div className="p-6 font-semibold text-gray-500">Feature</div>
                <div className="p-6 text-center border-x border-gray-100">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Z</span>
                    </div>
                    <span className="font-bold text-gray-900">Zenixa</span>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <span className="font-semibold text-gray-400">Shopify</span>
                </div>
              </div>

              {/* Table Rows */}
              {[
                { feature: "Pricing Model", zenixa: "One-time $199", shopify: "$29-299/month", zenikaBetter: true },
                { feature: "Transaction Fees", zenixa: "0%", shopify: "0.5-2%", zenikaBetter: true },
                { feature: "Source Code Access", zenixa: "Full ownership", shopify: "No access", zenikaBetter: true },
                { feature: "Hosting Included", zenixa: "Self-hosted freedom", shopify: "Locked to Shopify", zenikaBetter: true },
                { feature: "Customization", zenixa: "Unlimited", shopify: "Limited themes", zenikaBetter: true },
                { feature: "Mobile Responsive", zenixa: true, shopify: true, zenikaBetter: null },
                { feature: "SSL Certificate", zenixa: true, shopify: true, zenikaBetter: null },
                { feature: "3-Year Cost", zenixa: "$199 total", shopify: "$1,044-10,764", zenikaBetter: true },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-gray-100 last:border-0">
                  <div className="p-5 font-medium text-gray-700">{row.feature}</div>
                  <div className="p-5 text-center border-x border-gray-100 bg-blue-50/30">
                    {typeof row.zenixa === 'boolean' ? (
                      row.zenixa ? (
                        <Check className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className={`font-semibold ${row.zenikaBetter ? 'text-green-600' : 'text-gray-900'}`}>
                        {row.zenixa}
                      </span>
                    )}
                  </div>
                  <div className="p-5 text-center">
                    {typeof row.shopify === 'boolean' ? (
                      row.shopify ? (
                        <Check className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-gray-500">{row.shopify}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Savings Calculator */}
            <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Save up to $10,000+ over 3 years</h3>
              <p className="text-green-100 mb-6">That&apos;s money you keep in your pocket, not someone else&apos;s.</p>
              <Link href="#pricing">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 shadow-lg">
                  Start Saving Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
              <Rocket className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Simple Setup</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Launch in{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">3 simple steps</span>
            </h2>
            <p className="text-lg text-gray-600">
              Get your store online faster than you can finish your coffee
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Get Zenixa",
                description: "One-time purchase gives you lifetime access to the complete platform and source code.",
                icon: CreditCard
              },
              {
                step: "02",
                title: "Customize",
                description: "Add your products, set your branding, and customize your store to match your vision.",
                icon: Palette
              },
              {
                step: "03",
                title: "Start Selling",
                description: "Deploy to your domain and start accepting orders. Keep 100% of your revenue.",
                icon: Rocket
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-200 to-transparent" />
                )}
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-100">
                      <item.icon className="w-10 h-10 text-gray-700" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 max-w-xs mx-auto">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-100 mb-6">
              <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Customer Love</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Loved by{" "}
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">entrepreneurs</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Switched from Shopify and saved $2,000 in the first year alone. The platform is actually easier to use too!",
                author: "Sarah M.",
                role: "Fashion Boutique Owner",
                rating: 5
              },
              {
                quote: "The mobile experience is incredible. My conversion rate jumped 40% after launching with Zenixa.",
                author: "Ahmed K.",
                role: "Electronics Retailer",
                rating: 5
              },
              {
                quote: "Finally, a platform where I actually own my store. No more worrying about subscription hikes.",
                author: "Lisa T.",
                role: "Home Decor Shop",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 mb-6">
              <CreditCard className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Simple Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              One price,{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">lifetime access</span>
            </h2>
            <p className="text-lg text-gray-600">
              No hidden fees. No monthly subscriptions. No revenue sharing.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative bg-white rounded-3xl border-2 border-blue-500 shadow-2xl shadow-blue-500/10 overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-bl-xl">
                Most Popular
              </div>

              <div className="p-8 md:p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Zenixa Complete</h3>
                <p className="text-gray-500 mb-6">Everything you need to start selling</p>

                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl md:text-6xl font-bold text-gray-900">$199</span>
                  <span className="text-gray-500">one-time</span>
                </div>

                <Link href="/store" className="block mb-8">
                  <Button size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-xl">
                    Get Zenixa Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>

                <ul className="space-y-4">
                  {[
                    "Complete e-commerce platform",
                    "Full source code ownership",
                    "Mobile-responsive design",
                    "Admin dashboard",
                    "Product management",
                    "Order management",
                    "Customer accounts",
                    "SEO optimization",
                    "Analytics dashboard",
                    "Lifetime updates",
                    "Email support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Money Back Guarantee */}
              <div className="bg-gray-50 p-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Shield className="w-10 h-10 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">30-Day Money Back Guarantee</p>
                    <p className="text-sm text-gray-500">Not satisfied? Get a full refund, no questions asked.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <HeartHandshake className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Got Questions?</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently asked{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Do I really pay only once?",
                answer: "Yes! Zenixa is a one-time purchase. You pay once and own your store forever. No monthly fees, no yearly renewals, no hidden costs. The $199 you pay today is the total cost."
              },
              {
                question: "What about hosting?",
                answer: "You can host Zenixa anywhere you want - Vercel (free tier available), Netlify, your own server, or any hosting provider. You're in complete control. We recommend Vercel for the easiest setup."
              },
              {
                question: "Do I need technical skills?",
                answer: "Not at all! Zenixa comes with a beautiful admin panel that makes managing your store easy. Adding products, processing orders, and customizing your store can all be done without touching any code."
              },
              {
                question: "Can I customize the design?",
                answer: "Absolutely! You get the complete source code, so you can customize everything. Want to change colors? Easy. Want to add new features? Go ahead. It's your store to modify as you wish."
              },
              {
                question: "What payment methods are supported?",
                answer: "Zenixa integrates with popular payment gateways. You can accept credit cards, debit cards, and various local payment methods depending on your region."
              },
              {
                question: "Is there a money-back guarantee?",
                answer: "Yes! We offer a 30-day money-back guarantee. If Zenixa doesn't meet your expectations, simply reach out and we'll refund your purchase - no questions asked."
              },
              {
                question: "Do I get updates?",
                answer: "Yes, lifetime updates are included with your purchase. As we improve Zenixa and add new features, you'll have access to all updates at no additional cost."
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-16 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to own your online store?
              </h2>
              <p className="text-xl text-blue-100 mb-10">
                Join hundreds of entrepreneurs who&apos;ve switched to Zenixa and never looked back.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="#pricing">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-xl rounded-xl">
                    Get Zenixa for $199
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/store">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-white/30 text-white hover:bg-white/10 rounded-xl">
                    View Demo Store
                  </Button>
                </Link>
              </div>
              <p className="mt-8 text-blue-200 text-sm">
                30-day money-back guarantee. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Z</span>
                </div>
                <span className="text-xl font-bold text-white">Zenixa</span>
              </Link>
              <p className="text-gray-400 max-w-md leading-relaxed">
                The e-commerce platform you actually own. One-time payment, lifetime access, zero monthly fees.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/store" className="hover:text-white transition-colors">Demo</Link></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Zenixa. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
