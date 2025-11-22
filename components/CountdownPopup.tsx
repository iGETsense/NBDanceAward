/**
 * Countdown Popup Component
 * Small popup that appears on page load showing the countdown timer
 * Can be dismissed by user
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Clock } from 'lucide-react'
import { useEventCountdown } from '@/hooks/useEventCountdown'

export function CountdownPopup() {
  const countdown = useEventCountdown()
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Format number with leading zero
  const formatNumber = (num: number) => String(num).padStart(2, '0')

  if (!isMounted) return null

  return (
    <>
      {/* Popup - Shown on page load */}
      {isVisible && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
            onClick={() => setIsVisible(false)}
          />

          {/* Popup - Mobile First Responsive */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-full max-w-xs sm:max-w-sm md:max-w-md">
              {/* Close Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-yellow-600 rounded-full transition-colors z-10"
                aria-label="Close countdown"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
              </button>

              {/* Content - Mobile First */}
              <div className="p-6 sm:p-8 md:p-10 text-center">
                {countdown.isEnded ? (
                  // Event ended state
                  <>
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <Clock className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-gray-900" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                      Merci!
                    </h2>
                    <p className="text-gray-800 text-xs sm:text-sm md:text-base font-semibold">
                      Le vote est maintenant terminé.
                    </p>
                  </>
                ) : (
                  // Countdown active state
                  <>
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <Clock className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-gray-900" />
                    </div>
                    <div className="mb-4 sm:mb-6">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                        Temps Restant
                      </h2>
                      <p className="text-gray-800 text-xs sm:text-sm md:text-base font-semibold">
                        {countdown.isActive
                          ? 'Le vote est en cours!'
                          : 'Le vote commence bientôt...'}
                      </p>
                    </div>

                    {/* Countdown Display - Mobile First */}
                    <div className="flex justify-center gap-1 sm:gap-2 md:gap-3 flex-wrap mb-4 sm:mb-6">
                      {/* Days */}
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-900 text-yellow-300 rounded px-2 sm:px-3 md:px-4 py-1 sm:py-2 min-w-[40px] sm:min-w-[50px] md:min-w-[60px]">
                          <span className="text-sm sm:text-lg md:text-2xl font-bold font-mono">
                            {formatNumber(countdown.days)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 mt-0.5 sm:mt-1">
                          J
                        </span>
                      </div>

                      {/* Separator */}
                      <div className="flex items-center text-sm sm:text-lg md:text-2xl font-bold text-gray-900">
                        :
                      </div>

                      {/* Hours */}
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-900 text-yellow-300 rounded px-2 sm:px-3 md:px-4 py-1 sm:py-2 min-w-[40px] sm:min-w-[50px] md:min-w-[60px]">
                          <span className="text-sm sm:text-lg md:text-2xl font-bold font-mono">
                            {formatNumber(countdown.hours)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 mt-0.5 sm:mt-1">
                          H
                        </span>
                      </div>

                      {/* Separator */}
                      <div className="flex items-center text-sm sm:text-lg md:text-2xl font-bold text-gray-900">
                        :
                      </div>

                      {/* Minutes */}
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-900 text-yellow-300 rounded px-2 sm:px-3 md:px-4 py-1 sm:py-2 min-w-[40px] sm:min-w-[50px] md:min-w-[60px]">
                          <span className="text-sm sm:text-lg md:text-2xl font-bold font-mono">
                            {formatNumber(countdown.minutes)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 mt-0.5 sm:mt-1">
                          M
                        </span>
                      </div>

                      {/* Separator */}
                      <div className="flex items-center text-sm sm:text-lg md:text-2xl font-bold text-gray-900">
                        :
                      </div>

                      {/* Seconds */}
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-900 text-yellow-300 rounded px-2 sm:px-3 md:px-4 py-1 sm:py-2 min-w-[40px] sm:min-w-[50px] md:min-w-[60px]">
                          <span className="text-sm sm:text-lg md:text-2xl font-bold font-mono">
                            {formatNumber(countdown.seconds)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 mt-0.5 sm:mt-1">
                          S
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3 sm:mb-4">
                      <div className="h-1.5 sm:h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                          style={{
                            width: `${Math.max(0, (countdown.totalSeconds / (62 * 24 * 60 * 60)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-900 font-semibold">
                      Fin: 1er Février 2026 à 00h00
                    </p>
              </>
            )}

                {/* Close Button Text */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  Fermer ✕
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
