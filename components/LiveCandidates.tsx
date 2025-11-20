"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"

export default function LiveCandidates() {
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    const candidatesRef = ref(db, "candidates")
    const unsubscribe = onValue(candidatesRef, (snapshot) => {
      const data = snapshot.val() || {}
      setCandidates(Object.values(data))
    })

    return () => unsubscribe()
  }, [])

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
