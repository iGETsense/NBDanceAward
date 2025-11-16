"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ScrollAnimatedElement } from "@/components/ScrollAnimatedElement"

interface Partner {
  name: string
  logo: string
  url?: string
  tier?: "platinum" | "gold" | "silver" | "bronze"
}

interface PartnerLogosProps {
  partners: Partner[]
  title?: string
  subtitle?: string
  className?: string
  showTier?: boolean
  animated?: boolean
}

const PartnerLogos: React.FC<PartnerLogosProps> = ({
  partners,
  title = "Nos Partenaires",
  subtitle = "Ils nous font confiance et soutiennent l'excellence de la danse africaine",
  className,
  showTier = false,
  animated = true,
}) => {
  const getTierColor = (tier?: string) => {
    if (!tier) return "from-white to-gray-50 border-gray-200"
    switch (tier) {
      case "platinum": return "from-gray-100 to-gray-200 border-gray-300"
      case "gold": return "from-yellow-100 to-yellow-200 border-yellow-300"
      case "silver": return "from-gray-100 to-gray-200 border-gray-300"
      case "bronze": return "from-orange-100 to-orange-200 border-orange-300"
      default: return "from-white to-gray-50 border-gray-200"
    }
  }

  const getTierBadge = (tier?: string) => {
    if (!tier) return ""
    switch (tier) {
      case "platinum": return "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
      case "gold": return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
      case "silver": return "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
      case "bronze": return "bg-gradient-to-r from-orange-600 to-orange-700 text-white"
      default: return ""
    }
  }

  const getPartnersByTier = (tier?: string) => {
    if (!tier) return partners
    return partners.filter(p => p.tier === tier)
  }

  const renderPartnerGrid = (partnerList: Partner[], tier?: string) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
      {partnerList.map((partner, index) => (
        <div
          key={`${partner.name}-${index}`}
          className={cn(
            "group relative overflow-hidden rounded-lg border bg-white p-4 md:p-6 transition-all duration-300 hover:shadow-lg hover:scale-105",
            getTierColor(tier),
            !tier && "from-white to-gray-50 border-gray-200"
          )}
        >
          {partner.url ? (
            <a
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="relative w-full h-12 md:h-16 flex items-center justify-center">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                {showTier && partner.tier && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    getTierBadge(partner.tier)
                  )}>
                    {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
                  </span>
                )}
              </div>
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative w-full h-12 md:h-16 flex items-center justify-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
              {showTier && partner.tier && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  getTierBadge(partner.tier)
                )}>
                  {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const content = (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
          {title}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          {subtitle}
        </p>
      </div>

      {/* Partners by Tier */}
      {showTier ? (
        <div className="space-y-12 md:space-y-16">
          {["platinum", "gold", "silver", "bronze"].map((tier) => {
            const tierPartners = getPartnersByTier(tier)
            if (tierPartners.length === 0) return null
            
            return (
              <div key={tier} className="space-y-6">
                <div className="flex items-center justify-center">
                  <span className={cn(
                    "text-lg md:text-xl font-semibold px-4 py-2 rounded-full",
                    getTierBadge(tier)
                  )}>
                    Partenaires {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </span>
                </div>
                {renderPartnerGrid(tierPartners, tier)}
              </div>
            )
          })}
        </div>
      ) : (
        renderPartnerGrid(partners)
      )}
    </div>
  )

  return animated ? (
    <ScrollAnimatedElement>
      {content}
    </ScrollAnimatedElement>
  ) : (
    content
  )
}

export default PartnerLogos
