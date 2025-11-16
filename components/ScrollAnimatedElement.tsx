'use client'

import { useEffect, useRef } from 'react'
import { ReactNode } from 'react'

interface ScrollAnimatedElementProps {
  children: ReactNode
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'rotate'
  delay?: number
  className?: string
}

export const ScrollAnimatedElement = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}: ScrollAnimatedElementProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  const animationClass = {
    'fade-up': 'scroll-animate',
    'fade-left': 'scroll-animate-left',
    'fade-right': 'scroll-animate-right',
    scale: 'scroll-animate-scale',
    rotate: 'scroll-animate-rotate',
  }[animation]

  const delayClass = delay > 0 ? `scroll-delay-${Math.min(Math.ceil(delay / 100), 5)}` : ''

  return (
    <div
      ref={ref}
      className={`${animationClass} ${delayClass} ${className}`}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  )
}
