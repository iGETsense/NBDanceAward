/**
 * Event Countdown Hook
 * Calculates time remaining until event end
 * Event: December 1, 2024 21:00 to February 1, 2025 00:00
 */

import { useEffect, useState } from 'react'

export interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isActive: boolean
  isEnded: boolean
}

export function useEventCountdown() {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isActive: false,
    isEnded: false,
  })

  useEffect(() => {
    const calculateCountdown = () => {
      // Event dates - December 1, 2025 21:00 to February 1, 2026 00:00
      const now = new Date()
      const eventStart = new Date('2025-12-01T21:00:00').getTime()
      const eventEnd = new Date('2026-02-01T00:00:00').getTime()
      const nowTime = now.getTime()

      // If we're past the event end, show it as ended
      if (nowTime >= eventEnd) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isActive: false,
          isEnded: true,
        })
        return
      }

      // Check if event is active (started but not ended)
      const isActive = nowTime >= eventStart && nowTime < eventEnd

      // Calculate time remaining
      let timeRemaining: number
      if (nowTime < eventStart) {
        // Before event starts - count down to start
        timeRemaining = eventStart - nowTime
      } else {
        // Event is active - count down to end
        timeRemaining = eventEnd - nowTime
      }

      const totalSeconds = Math.floor(timeRemaining / 1000)
      const days = Math.floor(totalSeconds / (24 * 60 * 60))
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
      const seconds = totalSeconds % 60

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        isActive,
        isEnded: false,
      })
    }

    // Calculate immediately
    calculateCountdown()

    // Update every second
    const interval = setInterval(calculateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  return countdown
}
