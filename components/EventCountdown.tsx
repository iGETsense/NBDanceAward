/**
 * Event Countdown Component
 * Professional countdown timer for NB Dance Award
 * Displays time remaining until February 1, 2025 00:00
 */

'use client'

import { useEventCountdown } from '@/hooks/useEventCountdown'

export function EventCountdown() {
  const countdown = useEventCountdown()

  // Format number with leading zero
  const formatNumber = (num: number) => String(num).padStart(2, '0')

  return (
    <div className="w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 py-6 md:py-8">
      <div className="container mx-auto px-4 md:px-6">
        {countdown.isEnded ? (
          // Event ended state
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              🎉 Merci pour votre participation!
            </h2>
            <p className="text-gray-800 text-sm md:text-base">
              Le vote pour le NB Dance Award est maintenant terminé.
            </p>
          </div>
        ) : (
          // Countdown active state
          <div className="text-center">
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                ⏱️ Temps Restant
              </h2>
              <p className="text-gray-800 text-sm md:text-base font-semibold">
                {countdown.isActive
                  ? 'Le vote est en cours!'
                  : 'Le vote commence bientôt...'}
              </p>
            </div>

            {/* Countdown Display */}
            <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
              {/* Days */}
              <div className="flex flex-col items-center">
                <div className="bg-gray-900 text-yellow-300 rounded-lg px-3 md:px-5 py-2 md:py-3 min-w-[60px] md:min-w-[80px]">
                  <span className="text-2xl md:text-4xl font-bold font-mono">
                    {formatNumber(countdown.days)}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-900 mt-2">
                  {countdown.days === 1 ? 'Jour' : 'Jours'}
                </span>
              </div>

              {/* Separator */}
              <div className="flex items-center text-2xl md:text-4xl font-bold text-gray-900">
                :
              </div>

              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="bg-gray-900 text-yellow-300 rounded-lg px-3 md:px-5 py-2 md:py-3 min-w-[60px] md:min-w-[80px]">
                  <span className="text-2xl md:text-4xl font-bold font-mono">
                    {formatNumber(countdown.hours)}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-900 mt-2">
                  {countdown.hours === 1 ? 'Heure' : 'Heures'}
                </span>
              </div>

              {/* Separator */}
              <div className="flex items-center text-2xl md:text-4xl font-bold text-gray-900">
                :
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="bg-gray-900 text-yellow-300 rounded-lg px-3 md:px-5 py-2 md:py-3 min-w-[60px] md:min-w-[80px]">
                  <span className="text-2xl md:text-4xl font-bold font-mono">
                    {formatNumber(countdown.minutes)}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-900 mt-2">
                  {countdown.minutes === 1 ? 'Minute' : 'Minutes'}
                </span>
              </div>

              {/* Separator */}
              <div className="flex items-center text-2xl md:text-4xl font-bold text-gray-900">
                :
              </div>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="bg-gray-900 text-yellow-300 rounded-lg px-3 md:px-5 py-2 md:py-3 min-w-[60px] md:min-w-[80px]">
                  <span className="text-2xl md:text-4xl font-bold font-mono">
                    {formatNumber(countdown.seconds)}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-900 mt-2">
                  {countdown.seconds === 1 ? 'Seconde' : 'Secondes'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                  style={{
                    width: `${Math.max(0, (countdown.totalSeconds / (62 * 24 * 60 * 60)) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs md:text-sm text-gray-900 mt-2 font-semibold">
                Fin: 1er Février 2025 à 00h00
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
