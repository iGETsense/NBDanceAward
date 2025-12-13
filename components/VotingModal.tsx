"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Share2, Minus, Plus, Smartphone, AlertCircle, CheckCircle, CheckCircle2, Shield } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useVoting } from "@/hooks/useVoting"
import { encodeVoteLinkClient } from "@/lib/voteLinks"

interface VotingModalProps {
    isOpen: boolean
    onClose: (open: boolean) => void
    selectedCandidate: any | null
    customImagePositioning: { [key: string]: string }
}

export default function VotingModal({
    isOpen,
    onClose,
    selectedCandidate,
    customImagePositioning
}: VotingModalProps) {
    const [voteCount, setVoteCount] = useState(1)
    const [phoneNumber, setPhoneNumber] = useState("")
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"mobile" | "orange">("mobile")
    const [transactionId, setTransactionId] = useState<string | null>(null)

    // We can track provider locally if needed, similar to PageContent logic
    const [selectedProvider, setSelectedProvider] = useState("mtn-momo-cameroon")

    const {
        submitVote,
        pollPaymentStatus,
        isSubmitting,
        isVerifying,
        error: voteError,
        success: voteSuccess,
        paymentStatus,
        resetState
    } = useVoting()

    // Reset state when modal opens or candidate changes
    useEffect(() => {
        if (isOpen) {
            setVoteCount(1)
            setPhoneNumber("")
            setTransactionId(null)
            resetState()
            // Default to mobile/MTN
            setSelectedPaymentMethod("mobile")
        }
    }, [isOpen, selectedCandidate, resetState])

    useEffect(() => {
        if (selectedPaymentMethod === "mobile") {
            setSelectedProvider("mtn-momo-cameroon")
        } else if (selectedPaymentMethod === "orange") {
            setSelectedProvider("orange-money-cameroon")
        }
    }, [selectedPaymentMethod])

    const incrementVotes = () => setVoteCount((prev) => prev + 1)
    const decrementVotes = () => setVoteCount((prev) => Math.max(1, prev - 1))

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-zinc-800 p-0">
                <DialogTitle className="sr-only">
                    Voter pour {selectedCandidate?.name}
                </DialogTitle>
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Left Side - Your Vote */}
                    <div className="p-4 md:p-6 border-r border-zinc-800">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Votre Vote</h2>

                        {selectedCandidate && (
                            <>
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative mb-3">
                                        <div className="relative h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 overflow-hidden rounded-full border-4 md:border-[6px] border-yellow-500 bg-gradient-to-br from-purple-500 to-pink-500 p-1 md:p-2 flex items-center justify-center">
                                            <div className="relative h-full w-full overflow-hidden rounded-full flex items-center justify-center">
                                                <Image
                                                    src={selectedCandidate.image || "/placeholder.svg"}
                                                    alt={selectedCandidate.name}
                                                    fill
                                                    className="object-cover"
                                                    style={{ objectPosition: `${customImagePositioning[selectedCandidate.name] || "top"} center` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-1 right-1 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-pink-500">
                                            <Lock className="h-4 w-4 md:h-5 md:w-5 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-3">
                                        <h3 className="text-lg md:text-xl font-bold text-white">{selectedCandidate.name}</h3>
                                        <button
                                            onClick={() => {
                                                const voteLink = `${window.location.origin}/?vote=${encodeVoteLinkClient(selectedCandidate.id || selectedCandidate.baseId)}`
                                                navigator.clipboard.writeText(voteLink)
                                                // Show toast notification
                                                const toast = document.createElement('div')
                                                toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2'
                                                toast.textContent = 'Lien copié!'
                                                document.body.appendChild(toast)
                                                setTimeout(() => toast.remove(), 2000)
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors text-black text-xs font-semibold"
                                        >
                                            <Share2 className="h-3.5 w-3.5" />
                                            Partager
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-sm md:text-base font-semibold mb-2 text-white">Nombre de Votes</h3>
                                    <div className="flex items-center justify-center gap-3 md:gap-4 mb-2">
                                        <button
                                            onClick={decrementVotes}
                                            className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 border-zinc-700 hover:border-yellow-500 transition-colors text-white"
                                        >
                                            <Minus className="h-3 w-3 md:h-4 md:w-4 text-white" />
                                        </button>
                                        <div className="text-2xl md:text-3xl font-bold w-12 md:w-16 text-center text-white">{voteCount}</div>
                                        <button
                                            onClick={incrementVotes}
                                            className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 border-zinc-700 hover:border-yellow-500 transition-colors text-white"
                                        >
                                            <Plus className="h-3 w-3 md:h-4 md:w-4 text-white" />
                                        </button>
                                    </div>

                                    <div className="text-center space-y-0.5">
                                        <p className="text-xs md:text-sm font-semibold text-white">1 Vote = 105 XAF.</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={async () => {
                                        try {
                                            // Submit the vote
                                            const result = await submitVote({
                                                candidateId: selectedCandidate.id,
                                                voteCount,
                                                phoneNumber,
                                                paymentMethod: selectedPaymentMethod,
                                            })

                                            if (result.success && result.transactionId) {
                                                // Store transaction ID for tracking
                                                setTransactionId(result.transactionId)

                                                // Start polling for payment status
                                                const paymentResult = await pollPaymentStatus(result.transactionId)

                                                if (paymentResult.success && paymentResult.status === 'completed') {
                                                    // Payment successful, close modal after delay
                                                    setTimeout(() => {
                                                        onClose(false)
                                                        setPhoneNumber("")
                                                        setVoteCount(1)
                                                        setTransactionId(null)
                                                        resetState()
                                                    }, 2000)
                                                }
                                            }
                                        } catch (error) {
                                            console.error('Voting error:', error)
                                        }
                                    }}
                                    disabled={isSubmitting || isVerifying || !phoneNumber || phoneNumber.length < 9}
                                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 md:py-5 text-sm md:text-base rounded-full uppercase">
                                    {isSubmitting ? 'Submitting Vote...' : isVerifying ? 'Verifying Payment...' : 'Proceed to Payment'}
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Right Side - Secure Payment */}
                    <div className="p-4 md:p-6 bg-zinc-900/50">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Paiement Sécurisé</h2>

                        {/* Payment Methods */}
                        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
                            <button
                                onClick={() => {
                                    setSelectedPaymentMethod("mobile")
                                    setSelectedProvider("mtn-momo-cameroon")
                                }}
                                className={`flex flex-col items-center gap-1 md:gap-2 p-2 md:p-3 rounded-lg border-2 transition-all ${selectedPaymentMethod === "mobile"
                                    ? "border-yellow-500 bg-yellow-500/10"
                                    : "border-zinc-700 hover:border-zinc-600"
                                    }`}
                            >
                                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-orange-500">
                                    <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <span className="text-[10px] md:text-xs text-center font-medium leading-tight text-white">Mobile Money</span>
                            </button>

                            <button
                                onClick={() => {
                                    setSelectedPaymentMethod("orange")
                                    setSelectedProvider("orange-money-cameroon")
                                }}
                                className={`flex flex-col items-center gap-1 md:gap-2 p-2 md:p-3 rounded-lg border-2 transition-all ${selectedPaymentMethod === "orange"
                                    ? "border-yellow-500 bg-yellow-500/10"
                                    : "border-zinc-700 hover:border-zinc-600"
                                    }`}
                            >
                                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-orange-500">
                                    <span className="text-lg md:text-xl font-bold text-white">OM</span>
                                </div>
                                <span className="text-[10px] md:text-xs text-center font-medium leading-tight text-white">Orange Money</span>
                            </button>
                        </div>

                        {/* Selected Payment Method Display */}
                        <div className="mb-4 md:mb-6 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 p-3 text-center text-sm md:text-base font-semibold">
                            {selectedPaymentMethod === "mobile"
                                ? "Mobile Money"
                                : "Orange Money"}
                        </div>

                        {/* Total Price */}
                        <div className="mb-4 md:mb-6">
                            <div className="rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 px-3 py-2 md:px-4 md:py-3 text-center text-sm md:text-base font-bold text-black">
                                Prix Total: {(voteCount * 105).toLocaleString()} XAF
                            </div>
                        </div>

                        {/* Phone Number - Only show after payment method selected */}
                        {selectedPaymentMethod && (
                            <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                <h3 className="mb-3 text-base md:text-lg font-semibold text-white">
                                    {selectedPaymentMethod === 'mobile' ? 'Entrez votre numéro MTN' : 'Entrez votre numéro Orange'}
                                </h3>
                                <div className="relative">
                                    <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 md:gap-2">
                                        <span className="text-lg md:text-xl">🇨🇲</span>
                                        <span className="text-xs md:text-sm text-zinc-400">+237</span>
                                    </div>
                                    <Input
                                        type="tel"
                                        placeholder="6xx xxx xxx"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-20 md:pl-24 pr-10 md:pr-12 py-4 md:py-5 text-sm md:text-base text-white placeholder:text-zinc-500 focus:border-yellow-500"
                                    />
                                    <Lock className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-zinc-500" />
                                </div>
                            </div>
                        )}

                        {/* Error/Success Messages */}
                        {voteError && (
                            <div className="mb-4 md:mb-6 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/50 p-3 md:p-4">
                                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
                                <p className="text-xs md:text-sm text-red-500">{voteError}</p>
                            </div>
                        )}
                        {voteSuccess && (
                            <div className="mb-4 md:mb-6 flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/50 p-3 md:p-4">
                                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                                <p className="text-xs md:text-sm text-green-500">Vote submitted successfully! Closing...</p>
                            </div>
                        )}

                        {/* Payment Status Polling UI */}
                        {paymentStatus === 'pending' && transactionId && (
                            <div className="mb-4 md:mb-6 rounded-lg bg-blue-500/10 border border-blue-500/50 p-3 md:p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-4 w-4 md:h-5 md:w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs md:text-sm text-blue-500 font-semibold">Verifying Payment...</p>
                                </div>
                                <p className="text-[10px] md:text-xs text-blue-400">
                                    Please complete the payment on your phone. Transaction ID: {transactionId.slice(0, 8)}...
                                </p>
                                <p className="text-[10px] md:text-xs text-blue-300 mt-1">
                                    This may take up to 60 seconds. Do not close this window.
                                </p>
                            </div>
                        )}

                        {paymentStatus === 'completed' && (
                            <div className="mb-4 md:mb-6 rounded-lg bg-green-500/10 border border-green-500/50 p-3 md:p-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                                    <p className="text-xs md:text-sm text-green-500 font-semibold">Payment Confirmed!</p>
                                </div>
                                <p className="text-[10px] md:text-xs text-green-400 mt-1">
                                    Your votes have been successfully added. Thank you for your support!
                                </p>
                            </div>
                        )}

                        {paymentStatus === 'failed' && (
                            <div className="mb-4 md:mb-6 rounded-lg bg-red-500/10 border border-red-500/50 p-3 md:p-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
                                    <p className="text-xs md:text-sm text-red-500 font-semibold">Payment Failed</p>
                                </div>
                                <p className="text-[10px] md:text-xs text-red-400 mt-1">
                                    The payment could not be completed. Please try again or contact support.
                                </p>
                            </div>
                        )}

                        {/* Security Badges */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-[10px] md:text-xs text-zinc-400">
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <Shield className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                                <span>Chiffrement SSL Sécurisé</span>
                            </div>
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                                <span>Verifié par Stripe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
