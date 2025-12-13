"use client"

import { memo, useState } from "react"
import ImageWithFallback from "@/components/ImageWithFallback"
import { Button } from "@/components/ui/button"

interface Candidate {
    id: string
    name: string
    category: string
    image: string
    votes: number
    percentage: number
    badge?: string
    baseId?: string
}

interface CategoryListProps {
    candidates: Candidate[]
    screenSize: "mobile" | "tablet" | "desktop"
    customImagePositioning: { [key: string]: string }
    onCandidateClick: (candidate: Candidate) => void
}

const CategoryList = memo(({ candidates, screenSize, customImagePositioning, onCandidateClick }: CategoryListProps) => {
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({})

    // Determine categories from props
    const categories = Array.from(new Set(candidates.map(c => c.category))).sort()

    return (
        <>
            {categories.map((category) => {
                const categoryCandidates = candidates.filter((c) => c.category === category)
                const isExpanded = expandedCategories[category] || false
                const itemsPerRow = screenSize === "mobile" ? 2 : 5
                const displayedCandidates = isExpanded ? categoryCandidates : categoryCandidates.slice(0, itemsPerRow)
                const hasMore = categoryCandidates.length > itemsPerRow

                if (categoryCandidates.length === 0) return null

                return (
                    <section key={category} id={(category || 'unknown').toLowerCase().replace(/\s+/g, "-")} className="mb-12 md:mb-16">
                        <div className="mb-6 md:mb-8">
                            <h3 className="text-2xl md:text-3xl font-bold mb-2">{category || 'Unknown Category'}</h3>
                            <div className="h-1 w-20 bg-yellow-500 rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5">
                            {displayedCandidates.map((candidate, index) => (
                                <button
                                    key={`${category}-${candidate.id}-${index}`}
                                    onClick={() => onCandidateClick(candidate)}
                                    className="flex flex-col items-center cursor-pointer hover-lift transition-smooth"
                                >
                                    <div className="relative mb-3 md:mb-4">
                                        <div className="relative h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-full border-[3px] md:border-4 border-yellow-500 md:ring-4 md:ring-yellow-500/20 hover-glow transition-smooth">
                                            <ImageWithFallback
                                                src={candidate.image || "/placeholder.svg"}
                                                alt={candidate.name}
                                                fill
                                                objectFit="cover"
                                                objectPosition={`${customImagePositioning[candidate.name] || "top"} center`}
                                                placeholder="blur"
                                                sizes="(max-width: 768px) 96px, 112px"
                                            />
                                        </div>
                                        {candidate.badge && (
                                            <div className="absolute -top-1 -right-1 md:-bottom-1 md:-right-1 md:top-auto flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-pink-500 text-xs font-bold">
                                                {candidate.badge}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="mb-2 md:mb-3 text-center text-sm md:text-base font-semibold">{candidate.name}</h3>

                                    <div className="w-full max-w-[100px] md:max-w-none">
                                        <div className="mb-1.5 md:mb-2 h-1 md:h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                                            <div
                                                className="h-full bg-yellow-500 transition-all duration-500"
                                                style={{ width: `${candidate.percentage}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between text-[10px] md:text-xs text-zinc-400">
                                            <span className="font-semibold text-white">{(candidate?.votes || 0).toLocaleString()}</span>
                                            <span>{candidate?.percentage || 0}%</span>
                                        </div>
                                        <p className="text-[9px] md:text-[10px] text-zinc-500 text-center mt-0.5 md:mt-1">votes</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex justify-center mt-6 md:mt-8">
                                <button
                                    onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !isExpanded }))}
                                    className="px-6 md:px-8 py-2 md:py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors duration-200"
                                >
                                    {isExpanded ? "Voir Moins" : "Voir Plus"}
                                </button>
                            </div>
                        )}
                    </section>
                )
            })}
        </>
    )
})

CategoryList.displayName = "CategoryList"

export default CategoryList
