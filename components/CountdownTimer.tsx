"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  targetDate: Date
  onComplete?: () => void
  className?: string
}

export default function CountdownTimer({ targetDate, onComplete, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft | null => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference <= 0) {
        setIsExpired(true)
        onComplete?.()
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      }
    }

    // Calculate immediately
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      if (newTimeLeft === null) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  // Don't render if expired
  if (isExpired || timeLeft === null) {
    return null
  }

  return (
    <div className={`countdown-timer ${className}`}>
      <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
        <Clock className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 animate-pulse" />
        <span className="text-xs md:text-sm font-semibold text-yellow-500 uppercase tracking-wider">
          Fin des votes dans
        </span>
      </div>
      
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 blur-lg rounded-lg"></div>
            <div className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 min-w-[60px] md:min-w-[80px] text-center backdrop-blur-sm">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-500 tabular-nums">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
            </div>
          </div>
          <span className="text-[10px] md:text-xs text-zinc-400 mt-1 uppercase tracking-wider">Jours</span>
        </div>

        {/* Separator */}
        <div className="text-2xl md:text-3xl font-bold text-yellow-500/50 pb-6">:</div>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 blur-lg rounded-lg"></div>
            <div className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 min-w-[60px] md:min-w-[80px] text-center backdrop-blur-sm">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-500 tabular-nums">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
            </div>
          </div>
          <span className="text-[10px] md:text-xs text-zinc-400 mt-1 uppercase tracking-wider">Heures</span>
        </div>

        {/* Separator */}
        <div className="text-2xl md:text-3xl font-bold text-yellow-500/50 pb-6">:</div>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 blur-lg rounded-lg"></div>
            <div className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 min-w-[60px] md:min-w-[80px] text-center backdrop-blur-sm">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-500 tabular-nums">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
            </div>
          </div>
          <span className="text-[10px] md:text-xs text-zinc-400 mt-1 uppercase tracking-wider">Minutes</span>
        </div>

        {/* Separator */}
        <div className="text-2xl md:text-3xl font-bold text-yellow-500/50 pb-6">:</div>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 blur-lg rounded-lg"></div>
            <div className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 min-w-[60px] md:min-w-[80px] text-center backdrop-blur-sm">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-500 tabular-nums animate-pulse">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
            </div>
          </div>
          <span className="text-[10px] md:text-xs text-zinc-400 mt-1 uppercase tracking-wider">Secondes</span>
        </div>
      </div>
    </div>
  )
}

