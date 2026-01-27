"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { generateSlug } from "@/lib/utils"
import {
  Loader2, Plus, X, ArrowLeft, ArrowRight, Check,
  Info, Package, DollarSign, ImageIcon, Layers, Lightbulb,
  AlertCircle
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Category, Product, ProductVariant } from "@/types"
import { ImageUploader } from "@/components/admin/image-uploader"

const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.coerce.number().min(0),
  priceModifier: z.coerce.number(),
})

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  comparePrice: z.coerce.number().min(0).nullable().optional(),
  images: z.array(z.string()),
  categoryId: z.string().min(1, "Please select a category"),
  featured: z.boolean(),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product & { variants: ProductVariant[] }
  categories: Category[]
}

const steps = [
  { id: 1, title: "Basic Info", icon: Package, description: "Name, category & description" },
  { id: 2, title: "Pricing", icon: DollarSign, description: "Set your price" },
  { id: 3, title: "Images", icon: ImageIcon, description: "Add product photos" },
  { id: 4, title: "Variants", icon: Layers, description: "Size, color & stock" },
]

// Helpful tips for each step
const stepTips: Record<number, { title: string; tips: string[] }> = {
  1: {
    title: "Tips for Basic Info",
    tips: [
      "Use clear, descriptive product names that customers can easily search for",
      "Include relevant keywords in your description for better SEO",
      "Choose the most specific category that fits your product",
      "The slug is auto-generated but can be customized for cleaner URLs",
    ],
  },
  2: {
    title: "Pricing Tips",
    tips: [
      "Research competitor pricing to stay competitive",
      "Consider your costs, shipping, and desired profit margin",
      "Featured products appear on the homepage - use for best sellers",
      "You can set variant-specific price adjustments in the next step",
    ],
  },
  3: {
    title: "Image Best Practices",
    tips: [
      "Use high-quality images (minimum 800x800 pixels)",
      "Show the product from multiple angles",
      "Use a clean, neutral background for professional look",
      "Include lifestyle shots showing the product in use",
      "First image will be used as the main thumbnail",
    ],
  },
  4: {
    title: "Variant Management",
    tips: [
      "Add variants for different sizes, colors, or options",
      "Keep accurate stock counts to avoid overselling",
      "Price modifier adds/subtracts from the base price",
      "Leave size or color empty if not applicable",
    ],
  },
}

function FormTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help inline ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [imagePreviewErrors, setImagePreviewErrors] = useState<Set<number>>(new Set())

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      price: product?.price || 0,
      comparePrice: product?.comparePrice || null,
      images: product?.images || [],
      categoryId: product?.categoryId || "",
      featured: product?.featured || false,
      variants: product?.variants?.length
        ? product.variants.map((v) => ({
          id: v.id,
          size: v.size || "",
          color: v.color || "",
          stock: v.stock,
          priceModifier: v.priceModifier,
        }))
        : [{ size: "", color: "", stock: 0, priceModifier: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  })

  const watchedImages = watch("images") || []

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setValue("name", newName)
    if (!product) {
      setValue("slug", generateSlug(newName))
    }
  }

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof ProductFormData)[] = []

    switch (step) {
      case 1:
        fieldsToValidate = ["name", "slug", "categoryId"]
        break
      case 2:
        fieldsToValidate = ["price"]
        break
      case 3:
        // Images are optional, no validation needed
        return true
      case 4:
        fieldsToValidate = ["variants"]
        break
    }

    const result = await trigger(fieldsToValidate)
    return result
  }

  const goToNextStep = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        images: data.images,
      }

      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products"
      const method = product ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save product")
      }

      toast({
        title: "Success! 🎉",
        description: product ? "Product updated successfully" : "Product created successfully",
      })

      router.push("/admin/products")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const currentTips = stepTips[currentStep]

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-xl shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{product ? "Edit Product" : "Add New Product"}</h1>
              <p className="text-sm text-muted-foreground">Step {currentStep} of 4</p>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="h-10 md:h-11 px-4 md:px-6 rounded-xl hidden md:flex">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {product ? "Update" : "Create"}
              </>
            )}
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-1 md:gap-2 z-10 transition-all min-w-0 flex-1 ${isActive ? "scale-105" : ""
                    }`}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <StepIcon className="h-4 w-4 md:h-5 md:w-5" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs md:text-sm font-medium truncate ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
          {/* Progress line */}
          <div className="absolute top-5 md:top-6 left-0 right-0 h-0.5 bg-muted -z-0">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the essential details about your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Product Name *
                        <FormTooltip content="Choose a clear, descriptive name that customers can easily search for" />
                      </Label>
                      <Input
                        id="name"
                        {...register("name")}
                        onChange={handleNameChange}
                        placeholder="e.g., Wireless Bluetooth Headphones"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">
                        URL Slug *
                        <FormTooltip content="This appears in the product URL. Auto-generated from name but can be customized" />
                      </Label>
                      <Input
                        id="slug"
                        {...register("slug")}
                        placeholder="wireless-bluetooth-headphones"
                        className={errors.slug ? "border-destructive" : ""}
                      />
                      {errors.slug && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.slug.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">
                      Category *
                      <FormTooltip content="Choose the category that best describes your product" />
                    </Label>
                    <Select
                      value={watch("categoryId")}
                      onValueChange={(value) => setValue("categoryId", value)}
                    >
                      <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description
                      <FormTooltip content="Describe your product's features, benefits, and specifications" />
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe your product in detail. Include features, materials, dimensions, etc."
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 A good description helps customers make buying decisions and improves search visibility
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing & Options
                  </CardTitle>
                  <CardDescription>
                    Set your product's price and visibility options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        Sale Price (PKR) *
                        <FormTooltip content="The current selling price customers will pay" />
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">PKR</span>
                        <Input
                          id="price"
                          type="number"
                          {...register("price")}
                          placeholder="0"
                          className={`pl-14 text-lg font-semibold h-12 rounded-xl ${errors.price ? "border-destructive" : ""}`}
                        />
                      </div>
                      {errors.price && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.price.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comparePrice">
                        Original Price (PKR)
                        <FormTooltip content="Leave empty for no discount. If set, shows strikethrough price to customers" />
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">PKR</span>
                        <Input
                          id="comparePrice"
                          type="number"
                          {...register("comparePrice")}
                          placeholder="0"
                          className="pl-14 text-lg h-12 rounded-xl"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        💡 Original price before discount (optional)
                      </p>
                    </div>
                  </div>

                  {/* Discount Preview */}
                  {watch("comparePrice") && Number(watch("comparePrice")) > watch("price") && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Sale Active!</p>
                          <p className="text-xs text-green-600">Customers will see the discounted price</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            {Math.round(((Number(watch("comparePrice")) - watch("price")) / Number(watch("comparePrice"))) * 100)}% OFF
                          </p>
                          <p className="text-xs text-green-600">
                            Save PKR {(Number(watch("comparePrice")) - watch("price")).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="space-y-0.5">
                      <Label className="text-base">Featured Product</Label>
                      <p className="text-sm text-muted-foreground">
                        Show this product on the homepage for more visibility
                      </p>
                    </div>
                    <Switch
                      checked={watch("featured")}
                      onCheckedChange={(checked) => setValue("featured", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Images */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Product Images
                  </CardTitle>
                  <CardDescription>
                    Upload images or add from URL. First image is the main thumbnail.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    images={watchedImages}
                    onChange={(images) => setValue("images", images)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Variants */}
            {currentStep === 4 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Product Variants
                    </CardTitle>
                    <CardDescription>
                      Add size, color, and stock options for your product
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ size: "", color: "", stock: 0, priceModifier: 0 })}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Variant
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="font-medium flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          Variant {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>
                            Size
                            <FormTooltip content="Leave empty if size doesn't apply" />
                          </Label>
                          <Input
                            {...register(`variants.${index}.size`)}
                            placeholder="e.g., M, L, XL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            Color
                            <FormTooltip content="Leave empty if color doesn't apply" />
                          </Label>
                          <Input
                            {...register(`variants.${index}.color`)}
                            placeholder="e.g., Red, Blue"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            Stock *
                            <FormTooltip content="How many units do you have available?" />
                          </Label>
                          <Input
                            type="number"
                            {...register(`variants.${index}.stock`)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            Price Modifier
                            <FormTooltip content="Add or subtract from base price (e.g., +500 for premium size)" />
                          </Label>
                          <Input
                            type="number"
                            {...register(`variants.${index}.priceModifier`)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {errors.variants && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.variants.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons - Fixed at bottom on mobile */}
            <div className="flex justify-between gap-3 py-4 bg-white sticky bottom-0 -mx-4 px-4 border-t md:relative md:bottom-auto md:mx-0 md:px-0 md:border-0 md:py-0">
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevStep}
                disabled={currentStep === 1}
                className="h-12 md:h-11 px-5 rounded-xl flex-1 md:flex-none"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  className="h-12 md:h-11 px-6 rounded-xl flex-1 md:flex-none"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 md:h-11 px-6 rounded-xl flex-1 md:flex-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {product ? "Update" : "Create"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Tips Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-gradient-to-b from-blue-50 to-white border-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Lightbulb className="h-5 w-5" />
                  {currentTips?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {currentTips?.tips.map((tip, index) => (
                    <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-blue-500 font-bold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </TooltipProvider>
  )
}
