import { useState, useCallback } from 'react'
import { submitVoteToFirebase, validatePhoneNumber } from '@/lib/votingService'

interface VoteSubmissionData {
  candidateId: string
  voteCount: number
  phoneNumber: string
  paymentMethod: string
  provider: string
}

interface VoteSubmissionResult {
  success: boolean
  voteId?: string
  message?: string
  error?: string
}

export function useVoting() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [lastVoteId, setLastVoteId] = useState<string | null>(null)

  const submitVote = useCallback(
    async (data: VoteSubmissionData): Promise<VoteSubmissionResult> => {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      try {
        // Validate inputs
        if (!data.candidateId) {
          throw new Error('Candidate not selected')
        }

        if (data.voteCount < 1) {
          throw new Error('Vote count must be at least 1')
        }

        if (!validatePhoneNumber(data.phoneNumber)) {
          throw new Error('Invalid phone number format. Use: 6xx xxx xxx')
        }

        if (!data.paymentMethod) {
          throw new Error('Payment method not selected')
        }

        if (!data.provider) {
          throw new Error('Payment provider not selected')
        }

        // Submit vote to Firebase
        const result = await submitVoteToFirebase(
          data.candidateId,
          data.voteCount,
          data.phoneNumber,
          data.paymentMethod,
          data.provider
        )

        if (result.success) {
          setSuccess(true)
          setLastVoteId(result.voteId || null)
          return {
            success: true,
            voteId: result.voteId,
            message: result.message,
          }
        } else {
          throw new Error(result.error || 'Failed to submit vote')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    []
  )

  const resetState = useCallback(() => {
    setError(null)
    setSuccess(false)
    setLastVoteId(null)
  }, [])

  return {
    submitVote,
    isSubmitting,
    error,
    success,
    lastVoteId,
    resetState,
  }
}
