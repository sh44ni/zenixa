"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSliderProps {
    images: string[]
    title: string
    subtitle: string
    showText?: boolean

    showBadge?: boolean
    badgeText?: string

    showButton1?: boolean
    button1Text?: string
    button1Link?: string

    showButton2?: boolean
    button2Text?: string
    button2Link?: string

    autoPlayInterval?: number
}

export function HeroSlider({
    images,
    title,
    subtitle,
    showText = true,

    showBadge = true,
    badgeText = "New Collection 2026",

    showButton1 = true,
    button1Text = "Shop Now",
    button1Link = "/products",

    showButton2 = true,
    button2Text = "Explore Categories",
    button2Link = "/categories",

    autoPlayInterval = 5000
}: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }, [images.length])

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }, [images.length])

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
        setIsAutoPlaying(false)
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000)
    }

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || images.length <= 1) return

        const interval = setInterval(goToNext, autoPlayInterval)
        return () => clearInterval(interval)
    }, [isAutoPlaying, images.length, autoPlayInterval, goToNext])

    if (images.length === 0) {
        return null
    }

    return (
        <div className="relative w-full h-full overflow-hidden group">
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((image, index) => (
                    <div key={index} className="relative w-full h-full flex-shrink-0">
                        <Image
                            src={image}
                            alt={`Hero slide ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                        {/* Overlay gradient - only show when text is enabled */}
                        {showText && (
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                        )}
                    </div>
                ))}
            </div>

            {/* Content overlay - only show when text is enabled */}
            {showText && (
                <div className="absolute inset-0 flex items-center p-8 md:p-12 lg:p-16">
                    <div className="max-w-3xl space-y-6 text-white">
                        {showBadge && (
                            <div className="animate-fadeInUp inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium w-fit">
                                <Sparkles className="h-4 w-4" />
                                <span>{badgeText}</span>
                            </div>
                        )}

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fadeInUp animation-delay-100">
                            {title}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 animate-fadeInUp animation-delay-200">
                            {subtitle}
                        </p>

                        {(showButton1 || showButton2) && (
                            <div className="flex flex-wrap gap-3 animate-fadeInUp animation-delay-300 pt-2">
                                {showButton1 && (
                                    <Link href={button1Link}>
                                        <Button size="lg" className="h-12 px-8 rounded-full text-base bg-white text-black hover:bg-white/90 shadow-lg transition-all hover:scale-105">
                                            {button1Text}
                                        </Button>
                                    </Link>
                                )}
                                {showButton2 && (
                                    <Link href={button2Link}>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="h-12 px-8 rounded-full text-base bg-transparent border-white/30 text-white hover:bg-white/10 transition-all"
                                        >
                                            {button2Text} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Buttons only (when text is hidden but buttons are shown) */}
            {!showText && (showButton1 || showButton2) && (
                <div className="absolute inset-0 flex items-end justify-center pb-8 md:pb-12 gap-3">
                    {showButton1 && (
                        <Link href={button1Link}>
                            <Button size="lg" className="h-12 px-8 rounded-full text-base bg-white text-black hover:bg-white/90 shadow-lg transition-all hover:scale-105">
                                {button1Text}
                            </Button>
                        </Link>
                    )}
                    {showButton2 && (
                        <Link href={button2Link}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 px-8 rounded-full text-base bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                            >
                                {button2Text} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            )
            }

            {/* Navigation arrows */}
            {
                images.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12 rounded-full"
                            onClick={goToPrev}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12 rounded-full"
                            onClick={goToNext}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </>
                )
            }

            {/* Dots indicator */}
            {
                images.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? "bg-white w-8"
                                    : "bg-white/50 hover:bg-white/70"
                                    }`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )
            }
        </div >
    )
}
