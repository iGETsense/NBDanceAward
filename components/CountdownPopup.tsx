/**
 * Enhanced Countdown Component
 * - Shows full popup modal on first visit only
 * - Converts to compact side widget after closing
 * - Toggle button to show/hide widget
 * - Smooth animations throughout
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEventCountdown } from '@/hooks/useEventCountdown'

const STORAGE_KEY = 'nb-dance-countdown-seen'

export function CountdownPopup() {
  const countdown = useEventCountdown()
  const [showFullPopup, setShowFullPopup] = useState(false)
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem(STORAGE_KEY)
    if (!hasSeenPopup) {
      setShowFullPopup(true)
    }
  }, [])

  const handleClosePopup = () => {
    setShowFullPopup(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const formatNumber = (num: number) => String(num).padStart(2, '0')

  if (!isMounted) return null

  return (
    <>
      {/* Full Popup Modal - First Visit Only */}
      {showFullPopup && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 animate-fade-in"
            onClick={handleClosePopup}
          />

          {/* Popup */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md animate-scale-in">
              {/* Close Button */}
              <button
                onClick={handleClosePopup}
                className="absolute top-4 right-4 p-2 hover:bg-yellow-600 rounded-full transition-colors z-10"
                aria-label="Close countdown"
              >
                <X className="h-6 w-6 text-gray-900" />
              </button>

              {/* Content */}
              <div className="p-8 md:p-10 text-center">
                {countdown.isEnded ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <Clock className="h-14 w-14 text-gray-900" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      Merci!
                    </h2>
                    <p className="text-gray-800 text-base font-semibold">
                      Le vote est maintenant terminé.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <Clock className="h-14 w-14 text-gray-900" />
                    </div>
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Temps Restant
                      </h2>
                      <p className="text-gray-800 text-base font-semibold">
                        {countdown.isActive
                          ? 'Le vote est en cours!'
                          : 'Le vote commence bientôt...'}
                      </p>
                    </div>

                    {/* Countdown Display */}
                    <div className="flex justify-center gap-2 mb-6">
                      {/* Days */}
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-900 text-yellow-300 rounded px-4 py-2 min-w-[60px]">
                          <span className="text-2xl font-bold font-mono">
                            {formatNumber(countdown.days)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 mt-1">J</span>
                      </div>

                      <div className="flex items-center text-2xl font-bold text-gray-900">:</div>

                      {/* Hours */}
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-900 text-yellow-300 rounded px-4 py-2 min-w-[60px]">
                          <span className="text-2xl font-bold font-mono">
                            {formatNumber(countdown.hours)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 mt-1">H</span>
                      </div>

                      <div className="flex items-center text-2xl font-bold text-gray-900">:</div>

                      {/* Minutes */}
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-900 text-yellow-300 rounded px-4 py-2 min-w-[60px]">
                          <span className="text-2xl font-bold font-mono">
                            {formatNumber(countdown.minutes)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 mt-1">M</span>
                      </div>

                      <div className="flex items-center text-2xl font-bold text-gray-900">:</div>

                      {/* Seconds */}
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-900 text-yellow-300 rounded px-4 py-2 min-w-[60px]">
                          <span className="text-2xl font-bold font-mono">
                            {formatNumber(countdown.seconds)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 mt-1">S</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                          style={{
                            width: `${Math.max(0, (countdown.totalSeconds / (62 * 24 * 60 * 60)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-900 font-semibold">
                      Fin: 1er Février 2026 à 00h00
                    </p>
                  </>
                )}

                <button
                  onClick={handleClosePopup}
                  className="mt-6 text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  Fermer ✕
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Side Widget - Shows after first visit */}
      {!showFullPopup && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
          {/* Toggle Button */}
          <button
            onClick={() => setIsWidgetExpanded(!isWidgetExpanded)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 p-3 rounded-l-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isWidgetExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            aria-label="Toggle countdown"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-xs font-bold hidden sm:inline">
                {formatNumber(countdown.days)}:{formatNumber(countdown.hours)}
              </span>
              <ChevronLeft className="h-4 w-4" />
            </div>
          </button>

          {/* Expanded Widget */}
          <div
            className={`bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-l-2xl shadow-2xl transition-all duration-300 ${isWidgetExpanded
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0 pointer-events-none'
              }`}
          >
            <div className="p-4 sm:p-6 w-64 sm:w-80">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-gray-900" />
                  <h3 className="text-lg font-bold text-gray-900">Temps Restant</h3>
                </div>
                <button
                  onClick={() => setIsWidgetExpanded(false)}
                  className="p-1.5 hover:bg-yellow-600 rounded-full transition-colors"
                  aria-label="Close widget"
                >
                  <ChevronRight className="h-5 w-5 text-gray-900" />
                </button>
              </div>

              {countdown.isEnded ? (
                <p className="text-gray-800 text-sm font-semibold text-center py-4">
                  Le vote est terminé
                </p>
              ) : (
                <>
                  {/* Compact Countdown */}
                  <div className="flex justify-center gap-1.5 mb-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-900 text-yellow-300 rounded px-2.5 py-1.5 min-w-[45px]">
                        <span className="text-lg font-bold font-mono">
                          {formatNumber(countdown.days)}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-900 mt-0.5">J</span>
                    </div>

                    <div className="flex items-center text-lg font-bold text-gray-900">:</div>

                    <div className="flex flex-col items-center">
                      <div className="bg-gray-900 text-yellow-300 rounded px-2.5 py-1.5 min-w-[45px]">
                        <span className="text-lg font-bold font-mono">
                          {formatNumber(countdown.hours)}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-900 mt-0.5">H</span>
                    </div>

                    <div className="flex items-center text-lg font-bold text-gray-900">:</div>

                    <div className="flex flex-col items-center">
                      <div className="bg-gray-900 text-yellow-300 rounded px-2.5 py-1.5 min-w-[45px]">
                        <span className="text-lg font-bold font-mono">
                          {formatNumber(countdown.minutes)}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-900 mt-0.5">M</span>
                    </div>

                    <div className="flex items-center text-lg font-bold text-gray-900">:</div>

                    <div className="flex flex-col items-center">
                      <div className="bg-gray-900 text-yellow-300 rounded px-2.5 py-1.5 min-w-[45px]">
                        <span className="text-lg font-bold font-mono">
                          {formatNumber(countdown.seconds)}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-900 mt-0.5">S</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                        style={{
                          width: `${Math.max(0, (countdown.totalSeconds / (62 * 24 * 60 * 60)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-900 font-semibold text-center">
                    Fin: 1er Février 2026
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
