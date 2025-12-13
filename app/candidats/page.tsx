"use client"

import { Menu, X, ChevronDown, ChevronUp, Plus, Minus, Lock, AlertCircle, CheckCircle, CheckCircle2, Loader2, Share2, Smartphone, Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import CandidatesGrid from "@/components/CandidatesGrid"
import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CountdownPopup } from "@/components/CountdownPopup"
import { useCandidates } from "@/hooks/useFirebaseData"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { decodeVoteLinkClient, encodeVoteLinkClient } from "@/lib/voteLinks"
import { useVoting } from "@/hooks/useVoting"
import { VOTE_PRICE } from "@/lib/config"

// Old static candidates removed for cleanliness

const categories = [
  "Toutes les catégories",
  "Meilleur artiste danseur - masculin",
  "Meilleure artiste danseuse féminine",
  "Meilleur groupe de danse",
  "Meilleur collaboration duo",
  "Meilleur artiste Chorégraphe",
  "Meilleur Performance web",
  "Meilleur artiste danseur au rythme folklorique",
  "Meilleur artiste danseur afro coupé décalé",
  "Meilleur artiste danseur mbolé",
  "Meilleure artiste danseuse mbolé",
  "Meilleur artiste danseur de l'année",
  "Meilleur artiste jeune danseur/danseuse",
  "Meilleure artiste danseuse de l'année",
]

// Candidates with custom image positioning (for better head visibility)
const customImagePositioning: { [key: string]: string } = {
  "LMN ponce Off": "top -20px",
  "Stella officielle3": "top -20px",
  "Nelly Dora": "center",
  "Chica bassa": "center",
  "Influence Femi": "center",
  "Jessi 237": "center",
  "Talented Afro": "top",
}

export default function CandidatsPage() {
  // Firebase hook
  const { candidates: allCandidates, loading: candidatesLoading } = useCandidates()
  const { submitVote, pollPaymentStatus, isSubmitting, isVerifying, error: voteError, success: voteSuccess, paymentStatus, resetState } = useVoting()
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories")
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)
  const [voteCount, setVoteCount] = useState(1)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"mobile" | "orange">("mobile")
  const [selectedProvider, setSelectedProvider] = useState("mtn-momo-cameroon")
  const [showBanner, setShowBanner] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [shuffledCandidates, setShuffledCandidates] = useState<any[]>([])
  const [phoneNumber, setPhoneNumber] = useState("")

  // Scroll animations
  const pageTitle = useScrollAnimation()
  const searchSection = useScrollAnimation()
  const categoriesSection = useScrollAnimation()

  // Shuffle candidates only on initial load
  useEffect(() => {
    if (allCandidates.length > 0 && shuffledCandidates.length === 0) {
      // Deduplicate candidates by baseId (keep first occurrence)
      const uniqueCandidates = allCandidates.reduce((acc: any[], current: any) => {
        const baseId = current.baseId || current.id
        const exists = acc.find((item: any) => (item.baseId || item.id) === baseId)
        if (!exists) {
          acc.push(current)
        }
        return acc
      }, [])

      const shuffleArray = (array: any[]) => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }
      setShuffledCandidates(shuffleArray(uniqueCandidates))
    }
  }, [allCandidates, shuffledCandidates.length])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setShowBanner(true)
      } else {
        setShowBanner(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (selectedPaymentMethod === "mobile") {
      setSelectedProvider("mtn-momo-cameroon")
    } else if (selectedPaymentMethod === "orange") {
      setSelectedProvider("orange-money-cameroon")
    }
  }, [selectedPaymentMethod])

  // Handle direct vote links from URL params
  useEffect(() => {
    const voteParam = searchParams?.get('vote')
    if (voteParam && allCandidates.length > 0 && !selectedCandidate) {
      const candidateId = decodeVoteLinkClient(voteParam)
      if (candidateId) {
        const candidate = allCandidates.find(c => c.id === candidateId || c.baseId === candidateId)
        if (candidate) {
          setSelectedCandidate(candidate)
          setVoteCount(1)
          setPhoneNumber("")
          setIsVotingModalOpen(true)
        }
      }
    }
  }, [searchParams, allCandidates, selectedCandidate])

  const handleCandidateClick = (candidate: (typeof allCandidates)[0]) => {
    setSelectedCandidate(candidate)
    setVoteCount(1)
    setPhoneNumber("")
    setIsVotingModalOpen(true)
  }

  const incrementVotes = () => setVoteCount((prev) => prev + 1)
  const decrementVotes = () => setVoteCount((prev) => Math.max(1, prev - 1))

  // Filter candidates - use full list for specific categories, deduplicated for "All"
  const filteredCandidates = useMemo(() => {
    // When a specific category is selected, use ALL candidates (no deduplication)
    const candidatesToFilter = selectedCategory === "Toutes les catégories"
      ? shuffledCandidates  // Deduplicated list for "All Categories"
      : allCandidates       // Full list with duplicates for specific categories

    return candidatesToFilter.filter((candidate) => {
      const matchesSearch = (candidate?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "Toutes les catégories" || (candidate?.category || '') === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [selectedCategory, shuffledCandidates, allCandidates, searchQuery])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-black py-3 text-center text-sm tracking-[0.3em] text-white font-light shadow-xl transition-all duration-300 ${showBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      >
        NB DANCE AWARDS
      </div>

      <header
        className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-[#0a0a0a] transition-all duration-300"
        style={{ marginTop: showBanner ? "48px" : "0" }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image src="/logo.png" alt="NB Dance Award" fill className="object-contain" quality={90} sizes="(max-width: 768px) 40px, 48px" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:gap-1">
              <span className="text-xs font-bold leading-tight text-white md:hidden">
                NB DANCE
                <br />
                AWARDS
              </span>
              <div className="hidden md:flex items-center gap-1 text-xl font-bold">
                <span className="text-white">NB</span>
                <span className="text-yellow-500">Dance Awards</span>
              </div>
            </div>
          </Link>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden hover-scale transition-smooth">
                <Menu className="h-6 w-6 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-[#0a0a0a] border-zinc-800 animate-slide-in-left">
              <SheetHeader className="mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12">
                    <Image src="/logo.png" alt="NB Dance Award" fill className="object-contain" quality={90} sizes="48px" />
                  </div>
                  <SheetTitle className="text-left">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">NB DANCE</span>
                      <span className="text-sm font-bold text-white">AWARDS</span>
                    </div>
                  </SheetTitle>
                </div>
              </SheetHeader>

              <nav className="flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Accueil
                </Link>
                <a
                  href="#"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Candidats
                </a>
                <Link
                  href="/regles"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Règles
                </Link>
                <Link
                  href="/classement"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Classement
                </Link>

              </nav>
            </SheetContent>
          </Sheet>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/" className="text-zinc-400 hover:text-purple-400 transition-colors">
              Accueil
            </Link>
            <a href="#" className="text-white hover:text-purple-400 transition-colors">
              Candidats
            </a>
            <Link href="/regles" className="text-zinc-400 hover:text-purple-400 transition-colors">
              Règles
            </Link>
            <Link href="/classement" className="text-zinc-400 hover:text-purple-400 transition-colors">
              Classement
            </Link>

          </nav>
        </div>
      </header>

      {/* Countdown Popup */}
      <CountdownPopup />

      <div className="pt-[108px]">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8 text-center">
            <h1 ref={pageTitle.ref as any} className={`text-3xl md:text-4xl font-bold mb-2 transition-all duration-700 ${pageTitle.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>Tous les Candidats</h1>
            <p className={`text-yellow-500 font-semibold transition-all duration-700 delay-100 ${pageTitle.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>NB DANCE AWARDS</p>
          </div>

          {/* Loading State */}
          {candidatesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent"></div>
                <p className="mt-4 text-zinc-400">Chargement des candidats...</p>
              </div>
            </div>
          ) : allCandidates.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-xl text-zinc-400 mb-2">Aucun candidat disponible</p>
                <p className="text-sm text-zinc-500">Les candidats seront affichés une fois chargés depuis le serveur.</p>
              </div>
            </div>
          ) : null}

          <div ref={categoriesSection.ref as any} className="mb-8">
            <h2 className={`text-xl font-bold mb-4 text-center transition-all duration-700 ${categoriesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>Catégories</h2>
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex md:flex-wrap md:justify-center gap-2 md:gap-3 min-w-max md:min-w-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === category
                      ? "bg-yellow-500 text-black"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div ref={searchSection.ref as any} className="mb-8 md:mb-12">
            <div className={`relative max-w-2xl mx-auto transition-all duration-700 ${searchSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Rechercher un candidat par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-2 border-zinc-700 bg-zinc-900 pl-12 pr-4 py-6 text-base text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:outline-none"
              />
            </div>
            {(searchQuery || selectedCategory !== "Toutes les catégories") && (
              <p className="mt-4 text-center text-sm text-zinc-400">
                {filteredCandidates.length} candidat{filteredCandidates.length !== 1 ? "s" : ""} trouvé
                {filteredCandidates.length !== 1 ? "s" : ""}
                {selectedCategory !== "Toutes les catégories" && ` dans "${selectedCategory}"`}
              </p>
            )}
          </div>

          {filteredCandidates.length > 0 ? (
            <CandidatesGrid
              candidates={filteredCandidates}
              customImagePositioning={customImagePositioning}
              onCandidateClick={handleCandidateClick}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-16 w-16 text-zinc-700 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun candidat trouvé</h3>
              <p className="text-zinc-400">
                {searchQuery ? (
                  <>
                    Essayez de rechercher avec un autre nom ou{" "}
                    <button onClick={() => setSearchQuery("")} className="text-yellow-500 hover:text-yellow-400">
                      effacer la recherche
                    </button>
                  </>
                ) : (
                  <>
                    Aucun candidat dans cette catégorie.{" "}
                    <button
                      onClick={() => setSelectedCategory("Toutes les catégories")}
                      className="text-yellow-500 hover:text-yellow-400"
                    >
                      Voir toutes les catégories
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>



      <Dialog open={isVotingModalOpen} onOpenChange={setIsVotingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-zinc-800 p-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Your Vote */}
            <div className="p-4 md:p-6 border-r border-zinc-800">
              {/* Important Warning */}
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-200">
                  <p className="font-semibold text-yellow-400 mb-1">⚠️ Important !</p>
                  <p>Restez sur cette page jusqu&apos;à la fin de la transaction. Ne fermez pas votre navigateur pendant le paiement.</p>
                </div>
              </div>

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
                            sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
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
                      <p className="text-xs md:text-sm font-semibold text-white">1 Vote = {VOTE_PRICE} XAF.</p>
                      <p className="text-xs md:text-sm text-white">Minimum 1 vote.</p>
                    </div>
                  </div>

                  <Button
                    onClick={async () => {
                      if (!selectedCandidate || !phoneNumber) return

                      try {
                        const result = await submitVote({
                          candidateId: selectedCandidate.id,
                          voteCount,
                          phoneNumber,
                          paymentMethod: selectedPaymentMethod,
                        })

                        if (result.success && result.transactionId) {
                          setTransactionId(result.transactionId)
                          const paymentResult = await pollPaymentStatus(result.transactionId)

                          if (paymentResult.success && paymentResult.status === 'completed') {
                            // Success - close modal after delay
                            setTimeout(() => {
                              setIsVotingModalOpen(false)
                              setPhoneNumber("")
                              setVoteCount(1)
                              setTransactionId(null)
                              resetState()
                            }, 2000)
                          } else if (paymentResult.status === 'timeout') {
                            // Timeout - payment may still be processing
                            // Keep modal open, user can see the message from useVoting hook
                            console.log('Payment verification timed out, transaction:', result.transactionId)
                          } else if (paymentResult.status === 'failed') {
                            // Failed - user can see error and retry
                            console.log('Payment failed:', paymentResult.message)
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
                  Prix Total: {(voteCount * VOTE_PRICE).toLocaleString()} XAF
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
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
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
                    This may take up to 3 minutes. Do not close this window.
                  </p>
                </div>
              )}

              {paymentStatus === 'completed' && (
                <div className="mb-4 md:mb-6 rounded-lg bg-green-500/10 border border-green-500/50 p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
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

              {paymentStatus === 'timeout' && transactionId && (
                <div className="mb-4 md:mb-6 rounded-lg bg-yellow-500/10 border border-yellow-500/50 p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-yellow-500 font-semibold">Vérification en cours...</p>
                  </div>
                  <p className="text-[10px] md:text-xs text-yellow-400 mt-1">
                    Votre paiement est peut-être en cours de traitement. Vérifiez votre solde avant de réessayer.
                  </p>
                  <p className="text-[10px] md:text-xs text-yellow-300 mt-2 font-mono">
                    Référence: {transactionId}
                  </p>
                  <button
                    onClick={() => {
                      setIsVotingModalOpen(false)
                      setPhoneNumber("")
                      setVoteCount(1)
                      setTransactionId(null)
                      resetState()
                    }}
                    className="mt-3 text-xs text-yellow-400 underline hover:text-yellow-300"
                  >
                    Fermer et vérifier plus tard
                  </button>
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
    </div>
  )
}
