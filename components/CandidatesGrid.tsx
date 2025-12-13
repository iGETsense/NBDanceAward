"use client"

import { memo } from "react"
import ImageWithFallback from "@/components/ImageWithFallback"

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

interface CandidatesGridProps {
    candidates: Candidate[]
    customImagePositioning: { [key: string]: string }
    onCandidateClick: (candidate: Candidate) => void
}

const CandidatesGrid = memo(({ candidates, customImagePositioning, onCandidateClick }: CandidatesGridProps) => {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6 animate-stagger">
            {candidates.map((candidate, index) => (
                <button
                    key={`${candidate.id}-${index}`}
                    onClick={() => onCandidateClick(candidate)}
                    className="flex flex-col items-center cursor-pointer hover-lift animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
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
                            <div className="absolute -top-1 -right-1 md:-bottom-1 md:-right-1 md:top-auto flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-pink-500 text-xs font-bold animate-pop-in">
                                {candidate.badge}
                            </div>
                        )}
                    </div>

                    <h3 className="mb-1 md:mb-2 text-center text-sm md:text-base font-semibold">{candidate.name}</h3>

                    <span className="mb-2 px-2 py-0.5 text-[10px] md:text-xs bg-yellow-500/20 text-yellow-500 rounded-full transition-smooth hover:bg-yellow-500/30">
                        {candidate.category}
                    </span>

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
    )
})

CandidatesGrid.displayName = "CandidatesGrid"

export default CandidatesGrid
