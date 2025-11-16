"use client"

import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CarouselPartner {
  name: string
  logo: string
  url?: string
}

interface PartnersCarouselProps {
  partners: CarouselPartner[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showControls?: boolean
  className?: string
}

const PartnersCarousel: React.FC<PartnersCarouselProps> = ({
  partners,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)

  const itemsPerView = 3
  // Create an infinite loop by duplicating partners
  const extendedPartners = [...partners, ...partners, ...partners]

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => prevIndex - 1)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1)
    setIsAutoPlaying(false)
  }

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1)
    }, autoPlayInterval)

    return () => clearInterval(timer)
  }, [isAutoPlaying, autoPlayInterval])

  // Handle infinite loop wrapping
  useEffect(() => {
    if (currentIndex >= partners.length * 2) {
      const timer = setTimeout(() => {
        setCurrentIndex(partners.length)
      }, 0)
      return () => clearTimeout(timer)
    } else if (currentIndex < partners.length) {
      if (currentIndex < 0) {
        const timer = setTimeout(() => {
          setCurrentIndex(partners.length - 1)
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }, [currentIndex, partners.length])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(autoPlay)

  return (
    <div
      className={cn(
        "w-full bg-[#0a0a0a] py-8 sm:py-10 md:py-12 lg:py-16",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Title */}
        <h2 className="mb-8 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white sm:mb-10 md:mb-12 lg:mb-14">
          Nos Partenaires
        </h2>

        {/* Carousel Container */}
        <div className="relative px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Carousel Track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {extendedPartners.map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="w-full flex-shrink-0 px-1.5 sm:px-2 md:px-3"
                  style={{
                    width: `${100 / itemsPerView}%`,
                  }}
                >
                  <div className="group relative flex h-24 sm:h-32 md:h-40 lg:h-48 items-center justify-center overflow-hidden rounded-full border border-zinc-600 bg-gradient-to-br from-white/8 to-white/3 p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300 hover:border-yellow-400 hover:from-white/15 hover:to-white/8 hover:shadow-lg hover:shadow-yellow-500/30 backdrop-blur-sm">
                    {partner.url ? (
                      <a
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full w-full items-center justify-center"
                      >
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      </a>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          {showControls && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-4 md:-translate-x-6 lg:-translate-x-8 z-10 flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-13 lg:w-13 items-center justify-center rounded-full border border-yellow-400/60 bg-yellow-500/5 text-yellow-400 transition-all duration-300 hover:border-yellow-300 hover:bg-yellow-500/15 hover:text-yellow-300 hover:shadow-lg hover:shadow-yellow-500/40"
                aria-label="Previous partners"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-4 md:translate-x-6 lg:translate-x-8 z-10 flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-13 lg:w-13 items-center justify-center rounded-full border border-yellow-400/60 bg-yellow-500/5 text-yellow-400 transition-all duration-300 hover:border-yellow-300 hover:bg-yellow-500/15 hover:text-yellow-300 hover:shadow-lg hover:shadow-yellow-500/40"
                aria-label="Next partners"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          <div className="mt-6 sm:mt-7 md:mt-8 flex justify-center gap-2 sm:gap-2.5 md:gap-3">
            {Array.from({ length: partners.length }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsAutoPlaying(false)
                }}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  currentIndex % partners.length === index
                    ? "w-8 bg-yellow-400"
                    : "w-2.5 bg-zinc-600 hover:bg-zinc-500"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnersCarousel
