"use client"

import { Menu, X, ChevronDown, ChevronUp, Plus, Minus, Lock, AlertCircle, CheckCircle, CheckCircle2, Loader2, Share2, Smartphone, CreditCard, Award, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import ImageWithFallback from "@/components/ImageWithFallback"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import PartnersCarousel from "@/components/PartnersCarousel"
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useCandidates, useLeaderboard } from "@/hooks/useFirebaseData"
import { useVoting } from "@/hooks/useVoting"
import { CountdownPopup } from "@/components/CountdownPopup"
import { decodeVoteLinkClient, encodeVoteLinkClient } from "@/lib/voteLinks"
import CategoryList from "@/components/CategoryList"



const mainCategories = [
  "Meilleure artiste danseuse féminine",
  "Meilleure artiste danseuse mbolé",
  "Meilleur artiste jeune danseur/danseuse",
  "Meilleur Performance web",
  "Meilleur artiste Chorégraphe",
  "Meilleure artiste danseuse de l'année",
  "Meilleur collaboration duo",
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

const honoraryPrizes = [
  "Best inspiration pour la jeunesse",
  "Best soutien pour la jeunesse",
  "Prix d'encouragements (discipline & travail des danseurs)"
]

export default function NBDanceAwardPage() {
  // Firebase hook
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { leaderboard } = useLeaderboard(10)
  const searchParams = useSearchParams()

  const [showBanner, setShowBanner] = useState(true)
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)
  const [voteCount, setVoteCount] = useState(1)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"mobile" | "orange">("mobile")
  const [selectedProvider, setSelectedProvider] = useState("mtn-momo-cameroon")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [transactionId, setTransactionId] = useState<string | null>(null)

  // Voting hook with all features
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

  // Scroll animations
  const partnersSection = useScrollAnimation()
  const categoriesTitle = useScrollAnimation()
  const howItWorksSection = useScrollAnimation()

  // Removed unused state variables
  // const [displayedCandidatesCount, setDisplayedCandidatesCount] = useState(6)
  // const [selectedCategory, setSelectedCategory] = useState("Tous")

  // This variable was missing and caused the "undeclared variables" error.
  // It should contain all unique categories from the candidates list, plus "Tous".
  // Removed unused categories variable
  // const categories = ["Tous", ...new Set(candidates.map((c) => c.category))]


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
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setScreenSize("mobile")
      } else if (width < 1024) {
        setScreenSize("tablet")
      } else {
        setScreenSize("desktop")
      }
    }

    handleResize() // Initial check
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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
    if (voteParam && candidates.length > 0 && !selectedCandidate) {
      const candidateId = decodeVoteLinkClient(voteParam)
      if (candidateId) {
        const candidate = candidates.find(c => c.id === candidateId || c.baseId === candidateId)
        if (candidate) {
          setSelectedCandidate(candidate)
          setVoteCount(1)
          setIsVotingModalOpen(true)
        }
      }
    }
  }, [searchParams, candidates, selectedCandidate])

  const handleCandidateClick = (candidate: (typeof candidates)[0]) => {
    setSelectedCandidate(candidate)
    setVoteCount(1)
    setIsVotingModalOpen(true)
  }

  const incrementVotes = () => setVoteCount((prev) => prev + 1)
  const decrementVotes = () => setVoteCount((prev) => Math.max(1, prev - 1))

  // Removed unused loadMoreCandidates and related variables
  // const loadMoreCandidates = () => {
  //   setDisplayedCandidatesCount((prev) => Math.min(prev + 6, filteredCandidates.length))
  // }

  // Removed unused scrollToCandidates function
  // const scrollToCandidates = () => {
  //   const candidatesSection = document.getElementById("candidats")
  //   if (candidatesSection) {
  //     candidatesSection.scrollIntoView({ behavior: "smooth", block: "start" })
  //   }
  // }

  // Removed unused filteredCandidates, displayedCandidates, hasMoreCandidates, remainingCandidates variables
  // const filteredCandidates =
  //   selectedCategory === "Tous" ? candidates : candidates.filter((c) => c.category === selectedCategory)

  // const displayedCandidates = filteredCandidates.slice(0, displayedCandidatesCount)
  // const hasMoreCandidates = displayedCandidatesCount < filteredCandidates.length
  // const remainingCandidates = filteredCandidates.length - displayedCandidatesCount


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
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image src="/logo.png" alt="NB Dance Award" fill className="object-contain" priority quality={90} sizes="(max-width: 768px) 40px, 48px" />
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
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden">
                <Menu className="h-6 w-6 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-[#0a0a0a] border-zinc-800">
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
                  className="px-4 py-3 text-base font-medium text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Accueil
                </Link>
                <Link
                  href="/candidats"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Candidats
                </Link>
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
            <Link href="/" className="text-white hover:text-purple-400 transition-colors">
              Accueil
            </Link>
            <Link href="/candidats" className="text-zinc-400 hover:text-purple-400 transition-colors">
              Candidats
            </Link>
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
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="relative h-[400px] md:h-[500px]">
            <Image src="/banner-dancers.jpg" alt="Dancers performing on stage" fill className="object-cover animate-fade-in-up" priority quality={85} sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent animate-fade-in-down" />

            <div className="container relative mx-auto flex h-full flex-col justify-end px-4 pb-8 md:px-6 md:pb-12">
              <div className="max-w-2xl animate-fade-in-left" style={{ animationDelay: "0.2s" }}>
                <h1 className="mb-4 text-3xl font-bold leading-tight text-balance md:mb-6 md:text-5xl lg:text-6xl animate-fade-in-left" style={{ animationDelay: "0.3s" }}>
                  Célébrons les étoiles de la danse au Cameroun
                  <br />
                  1ère édition
                </h1>

                <Link href="/candidats">
                  <Button
                    size="lg"
                    className="mb-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold px-6 py-5 text-sm md:px-8 md:py-6 md:text-base rounded-md uppercase animate-pop-in hover-scale transition-smooth"
                    style={{ animationDelay: "0.4s" }}
                  >
                    VOTEZ MAINTENANT!
                  </Button>
                </Link>

                <p className="text-xs text-zinc-300 md:text-sm animate-fade-in-left" style={{ animationDelay: "0.5s" }}>Les votes sont payants</p>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Carousel */}
        <div ref={partnersSection.ref as any} className={`transition-all duration-700 ${partnersSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <PartnersCarousel
            partners={[
              { name: "LOGOGGG", logo: "/partners/LOGOGGG.png" },
              { name: "WhatsApp Image 1", logo: "/partners/WhatsApp Image 2025-10-07 à 17.22.43_94d52ea3.jpg" },
              { name: "WhatsApp Image 2", logo: "/partners/WhatsApp Image 2025-11-10 à 07.19.11_8ab8bff9.jpg" },
              { name: "WhatsApp Image 3", logo: "/partners/WhatsApp Image 2025-11-13 à 22.31.35_9f132a8b.jpg" },
              { name: "NB", logo: "/partners/nb.png" },
              { name: "IGS", logo: "/partners/igs.png" },
              { name: "Partenaire Officiel", logo: "/partners/partenaire officiel.jpg" },
              { name: "Photo Partner", logo: "/partners/photo_2025-08-18_12-32-07.png" },
            ]}
            autoPlay={true}
            autoPlayInterval={4000}
            showControls={true}
          />
        </div>

        <div className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 ref={categoriesTitle.ref as any} className={`mb-8 md:mb-12 text-3xl md:text-4xl font-bold text-center transition-all duration-700 ${categoriesTitle.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>Toutes les Catégories</h2>

            {candidatesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent"></div>
                  <p className="mt-4 text-zinc-400">Chargement des candidats...</p>
                </div>
              </div>
            ) : candidates.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="text-xl text-zinc-400 mb-2">Aucun candidat disponible</p>
                  <p className="text-sm text-zinc-500">Les candidats seront affichés une fois chargés depuis le serveur.</p>
                </div>
              </div>
            ) : (
              <CategoryList
                candidates={candidates}
                screenSize={screenSize}
                customImagePositioning={customImagePositioning}
                onCandidateClick={handleCandidateClick}
              />
            )}
          </div>
        </div>

        {/* How It Works Section */}
        <section ref={howItWorksSection.ref as any} className="border-t border-zinc-800 py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-8 text-center text-2xl font-bold md:mb-12 md:text-3xl">Comment Ça Marche ?</h2>

            <div className="grid gap-8 md:grid-cols-3 md:gap-12">
              <div className={`flex flex-col items-center text-center transition-all duration-700 delay-100 ${howItWorksSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-yellow-500 bg-gradient-to-br from-yellow-600/10 to-yellow-800/10 md:mb-6 md:h-24 md:w-24">
                  <Smartphone className="h-10 w-10 text-yellow-500 md:h-12 md:w-12" />
                </div>
                <div className="mb-2 text-sm font-bold text-yellow-500">GO</div>
                <h3 className="text-sm font-semibold md:text-base">1. Choisissez Votre Danseur</h3>
              </div>

              <div className={`flex flex-col items-center text-center transition-all duration-700 delay-200 ${howItWorksSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-yellow-500 bg-gradient-to-br from-yellow-600/10 to-yellow-800/10 md:mb-6 md:h-24 md:w-24">
                  <CreditCard className="h-10 w-10 text-yellow-500 md:h-12 md:w-12" />
                </div>
                <div className="mb-2 text-sm font-bold text-yellow-500">GG</div>
                <h3 className="text-sm font-semibold md:text-base">2. Payez Vos Votes!</h3>
              </div>

              <div className={`flex flex-col items-center text-center transition-all duration-700 delay-300 ${howItWorksSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-yellow-500 bg-gradient-to-br from-yellow-600/10 to-yellow-800/10 md:mb-6 md:h-24 md:w-24">
                  <Award className="h-10 w-10 text-yellow-500 md:h-12 md:w-12" />
                </div>
                <div className="mb-2 text-sm font-bold text-yellow-500">GQ</div>
                <h3 className="text-sm font-semibold md:text-base">3. Suivez le Classement en Temps Réel</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-8">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center gap-6">
              {/* Pagination dots for mobile */}
              <div className="flex gap-2 md:hidden">
                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                <div className="h-2 w-2 rounded-full bg-zinc-400" />
                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                <div className="h-2 w-2 rounded-full bg-zinc-600" />
              </div>

              <div className="flex gap-6 text-sm text-zinc-400 md:gap-8">
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
                <a href="/report-issue" className="hover:text-white transition-colors">
                  Signaler un Problème
                </a>
                <a href="#" className="hover:text-white transition-colors md:inline hidden">
                  Confidentialité
                </a>
              </div>

              <div className="flex items-center gap-6">
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 4.041v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 4.041v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 4.041v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>



      {/* Voting Modal */}
      <Dialog open={isVotingModalOpen} onOpenChange={setIsVotingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-zinc-800 p-0">
          <DialogTitle className="sr-only">
            Voter pour {selectedCandidate?.name}
          </DialogTitle>
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
                      /*<p className="text-xs md:text-sm text-white">Minimum 1 vote.</p>*/ pas necessaire
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
                              setIsVotingModalOpen(false)
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
    </div>
  )
}
