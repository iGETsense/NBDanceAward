"use client"

import { useCandidates } from "@/hooks/useFirebaseData"

export default function LiveCandidates() {
  const { candidates } = useCandidates()

  return (
    <div className="text-white">
      {candidates.map((c, idx) => (
        <div key={idx}>
          {c.name} — {c.votes} votes
        </div>
      ))}
    </div>
  )
}
