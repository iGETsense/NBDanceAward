"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { initializeFirebaseWithCandidates } from "@/lib/initFirebaseData"
import { RotateCcw } from "lucide-react"

export function ResetFirebaseButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleReset = async () => {
    if (!confirm("⚠️ Êtes-vous sûr? Cela va réinitialiser tous les candidats depuis le fichier JSON.")) {
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const result = await initializeFirebaseWithCandidates(true)
      if (result.success) {
        setMessage(`✅ ${result.count} candidats ont été réinitialisés avec succès!`)
        // Reload page after 2 seconds
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(`❌ Erreur: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Erreur: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleReset}
        disabled={isLoading}
        variant="destructive"
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        {isLoading ? "Réinitialisation..." : "Réinitialiser Firebase"}
      </Button>
      {message && (
        <p className={`text-sm ${message.includes("✅") ? "text-green-500" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </div>
  )
}
