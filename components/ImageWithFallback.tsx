"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ImageWithFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  objectFit?: "cover" | "contain" | "fill" | "scale-down"
  objectPosition?: string
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  objectFit = "cover",
  objectPosition = "center",
  placeholder = "blur",
  blurDataURL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23333' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23999'%3ELoading...%3C/text%3E%3C/svg%3E",
  onLoad,
  onError,
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Reset states when src changes
  useEffect(() => {
    setImageSrc(src)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
    // Use placeholder if image fails to load
    setImageSrc("/placeholder.svg")
  }

  const imageProps = {
    alt,
    className: `${className} ${isLoading ? "animate-pulse" : ""}`,
    priority,
    onLoadingComplete: handleLoadingComplete,
    onError: handleError,
    placeholder: placeholder as "blur" | "empty",
    blurDataURL,
  }

  if (fill) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-zinc-800">
        <Image
          src={imageSrc}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            objectFit,
            objectPosition,
          }}
          {...imageProps}
        />
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-zinc-400 text-sm">Image non disponible</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-zinc-800" style={{ width, height }}>
      <Image
        src={imageSrc}
        width={width}
        height={height}
        style={{
          objectFit,
          objectPosition,
        }}
        {...imageProps}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-zinc-400 text-sm">Image non disponible</p>
          </div>
        </div>
      )}
    </div>
  )
}
