"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Star, Loader2, ShoppingBag, User, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Review {
    id: string
    rating: number
    title: string | null
    comment: string
    createdAt: string
    user: {
        id: string
        name: string | null
        email: string
    }
}

interface ReviewsData {
    reviews: Review[]
    count: number
    averageRating: number
}

interface CanReviewData {
    canReview: boolean
    reason: string
    message: string
}

interface ProductReviewsProps {
    productId: string
    productName: string
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const { data: session } = useSession()
    const router = useRouter()

    const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
    const [canReviewData, setCanReviewData] = useState<CanReviewData | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [title, setTitle] = useState("")
    const [comment, setComment] = useState("")

    // Fetch reviews and check eligibility
    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Fetch reviews
                const reviewsRes = await fetch(`/api/reviews/${productId}`)
                const reviews = await reviewsRes.json()
                setReviewsData(reviews)

                // Check if user can review
                const canReviewRes = await fetch(`/api/reviews/can-review/${productId}`)
                const canReview = await canReviewRes.json()
                setCanReviewData(canReview)
            } catch (error) {
                console.error("Error fetching reviews:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [productId])

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!session) {
            router.push("/login")
            return
        }

        if (comment.trim().length < 10) {
            toast({
                title: "Review too short",
                description: "Please write at least 10 characters",
                variant: "destructive",
            })
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch(`/api/reviews/${productId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, title, comment }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit review")
            }

            toast({
                title: "Review submitted!",
                description: "Thank you for your feedback",
            })

            // Refresh reviews with recalculated average
            setReviewsData((prev) => {
                if (!prev) return prev
                const newReviews = [data, ...prev.reviews]
                const newCount = prev.count + 1
                const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0)
                const newAverage = Math.round((totalRating / newCount) * 10) / 10
                return { reviews: newReviews, count: newCount, averageRating: newAverage }
            })

            // Update can review status
            setCanReviewData({
                canReview: false,
                reason: "already_reviewed",
                message: "You have already reviewed this product",
            })

            // Reset form
            setRating(5)
            setTitle("")
            setComment("")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    const renderStars = (rating: number, interactive = false, size = "h-5 w-5") => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? "button" : undefined}
                        onClick={interactive ? () => setRating(star) : undefined}
                        onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
                        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                        className={interactive ? "cursor-pointer transition-transform hover:scale-110" : ""}
                        disabled={!interactive}
                    >
                        <Star
                            className={`${size} ${star <= (interactive ? hoverRating || rating : rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                                }`}
                        />
                    </button>
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Review Summary Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-6 w-6" />
                        Customer Reviews
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                        {reviewsData && reviewsData.count > 0 ? (
                            <>
                                {renderStars(Math.round(reviewsData.averageRating))}
                                <span className="text-lg font-semibold">
                                    {reviewsData.averageRating.toFixed(1)}
                                </span>
                                <span className="text-muted-foreground">
                                    ({reviewsData.count} {reviewsData.count === 1 ? "review" : "reviews"})
                                </span>
                            </>
                        ) : (
                            <span className="text-muted-foreground">0 reviews</span>
                        )}
                    </div>
                </div>
            </div>

            <Separator />

            {/* Review Form or Purchase Message */}
            {canReviewData && (
                <Card className={canReviewData.canReview ? "border-primary/20 bg-primary/5" : ""}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {canReviewData.canReview ? (
                                <>
                                    <Star className="h-5 w-5 text-primary" />
                                    Write a Review
                                </>
                            ) : canReviewData.reason === "no_purchase" ? (
                                <>
                                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                    Purchase to Review
                                </>
                            ) : canReviewData.reason === "not_logged_in" ? (
                                <>
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    Sign In to Review
                                </>
                            ) : (
                                <>
                                    <Star className="h-5 w-5 text-green-500" />
                                    Thanks for Your Review!
                                </>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {canReviewData.canReview ? (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    {renderStars(rating, true, "h-8 w-8")}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title">Title (optional)</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Summarize your experience"
                                        maxLength={100}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="comment">Your Review *</Label>
                                    <Textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your thoughts about this product..."
                                        rows={4}
                                        required
                                        minLength={10}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Minimum 10 characters ({comment.length}/10)
                                    </p>
                                </div>

                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Review"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-muted-foreground mb-4">{canReviewData.message}</p>
                                {canReviewData.reason === "not_logged_in" && (
                                    <Button onClick={() => router.push("/login")}>Sign In</Button>
                                )}
                                {canReviewData.reason === "no_purchase" && (
                                    <p className="text-sm text-muted-foreground">
                                        Once your order is delivered, you'll be able to leave a review.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviewsData && reviewsData.reviews.length > 0 ? (
                    reviewsData.reviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {renderStars(review.rating, false, "h-4 w-4")}
                                            {review.title && (
                                                <span className="font-semibold">{review.title}</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {review.user.name || review.user.email.split("@")[0]} •{" "}
                                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-foreground">{review.comment}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">No Reviews Yet</h3>
                            <p className="text-muted-foreground">
                                Be the first to review {productName}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
