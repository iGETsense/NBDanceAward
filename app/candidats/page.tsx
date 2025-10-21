"use client"

import { Search, Menu, Minus, Plus, Lock, Shield, CheckCircle2, User, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Smartphone, CreditCard } from "lucide-react"

const allCandidates = [
  {
    name: "Lil' Flex",
    title: "Queen of the Dance Floor",
    image: "/young-male-hip-hop-dancer.jpg",
    votes: 1847,
    badge: 1,
    percentage: 45,
    category: "Meilleur danseur masculin",
  },
  {
    name: "Qasen B",
    title: "Master of Movement",
    image: "/male-dancer-grey-background.jpg",
    votes: 2534,
    badge: 3,
    percentage: 62,
    category: "Meilleur Chorégraphe",
  },
  {
    name: "El Semuuri",
    title: "Dance Sensation",
    image: "/female-dancer-with-dreadlocks.jpg",
    votes: 1432,
    badge: 5,
    percentage: 35,
    category: "Meilleure danseuse féminine",
  },
  {
    name: "El Samu",
    title: "Rhythm King",
    image: "/male-dancer-curly-hair.jpg",
    votes: 1689,
    badge: null,
    percentage: 41,
    category: "Meilleur danseur coupé décalé",
  },
  {
    name: "DJ Smooth",
    title: "Flow Master",
    image: "/male-dancer-with-beard.jpg",
    votes: 2245,
    badge: 2,
    percentage: 55,
    category: "Meilleur danseur mbolé",
  },
  {
    name: "Lady Groove",
    title: "Dance Diva",
    image: "/female-dancer-purple-outfit.jpg",
    votes: 1298,
    badge: 4,
    percentage: 32,
    category: "Meilleure danseuse mbolé",
  },
  {
    name: "B-Boy Thunder",
    title: "Breaking Champion",
    image: "/young-male-hip-hop-dancer.jpg",
    votes: 1956,
    badge: null,
    percentage: 48,
    category: "Meilleur groupe de danse",
  },
  {
    name: "Miss Rhythm",
    title: "Afrobeat Queen",
    image: "/female-dancer-purple-outfit.jpg",
    votes: 1723,
    badge: null,
    percentage: 42,
    category: "Meilleur danse au rythme folklorique",
  },
  {
    name: "King Flex",
    title: "Urban Dance Legend",
    image: "/male-dancer-grey-background.jpg",
    votes: 2089,
    badge: null,
    percentage: 51,
    category: "Performance la plus virale",
  },
  {
    name: "Starlight",
    title: "Contemporary Artist",
    image: "/female-dancer-with-dreadlocks.jpg",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleure collaboration duo/trio",
  },
  {
    name: "Vibe Master",
    title: "Hip Hop Specialist",
    image: "/male-dancer-curly-hair.jpg",
    votes: 1834,
    badge: null,
    percentage: 45,
    category: "Meilleur danseur de l'année",
  },
  {
    name: "Soul Sister",
    title: "Dance Innovator",
    image: "/female-dancer-purple-outfit.jpg",
    votes: 1445,
    badge: null,
    percentage: 35,
    category: "Meilleure danseuse de l'année",
  },
]

const categories = [
  "Toutes les catégories",
  "Meilleur danseur masculin",
  "Meilleure danseuse féminine",
  "Meilleur groupe de danse",
  "Meilleure collaboration duo/trio",
  "Meilleur Chorégraphe",
  "Performance la plus virale",
  "Meilleur danse au rythme folklorique",
  "Meilleur danseur coupé décalé",
  "Meilleur danseur mbolé",
  "Meilleure danseuse mbolé",
  "Meilleur danseur de l'année",
  "Meilleur jeune danseur/danseuse",
  "Meilleure danseuse de l'année",
]

export default function CandidatsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories")
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<(typeof allCandidates)[0] | null>(null)
  const [voteCount, setVoteCount] = useState(5)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"mobile" | "orange" | "bank">("mobile")
  const [selectedProvider, setSelectedProvider] = useState("mtn-momo-cameroon")
  const [showBanner, setShowBanner] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

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
    } else if (selectedPaymentMethod === "bank") {
      setSelectedProvider("bank-transfer-cameroon")
    }
  }, [selectedPaymentMethod])

  const handleCandidateClick = (candidate: (typeof allCandidates)[0]) => {
    setSelectedCandidate(candidate)
    setVoteCount(5)
    setIsVotingModalOpen(true)
  }

  const incrementVotes = () => setVoteCount((prev) => prev + 1)
  const decrementVotes = () => setVoteCount((prev) => Math.max(5, prev - 1))

  const filteredCandidates = allCandidates.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Toutes les catégories" || candidate.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-black py-3 text-center text-sm tracking-[0.3em] text-white font-light shadow-xl transition-all duration-300 ${
          showBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        NB COMPANY PRESENTE
      </div>

      <header
        className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-[#0a0a0a] transition-all duration-300"
        style={{ marginTop: showBanner ? "48px" : "0" }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image src="/logo.png" alt="NB Dance Award" fill className="object-contain" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:gap-1">
              <span className="text-xs font-bold leading-tight text-white md:hidden">
                NB DANCE
                <br />
                AWARD
              </span>
              <div className="hidden md:flex items-center gap-1 text-xl font-bold">
                <span className="text-white">NB</span>
                <span className="text-yellow-500">Award</span>
              </div>
            </div>
          </Link>

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
                    <Image src="/logo.png" alt="NB Dance Award" fill className="object-contain" />
                  </div>
                  <SheetTitle className="text-left">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">NB DANCE</span>
                      <span className="text-sm font-bold text-white">AWARD</span>
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
                {isLoggedIn ? (
                  <a
                    href="#"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Mon Compte
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsLoginModalOpen(true)
                      setAuthMode("login")
                    }}
                    className="mx-4 mt-2 px-4 py-3 text-base font-bold bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-lg transition-colors"
                  >
                    Se Connecter
                  </button>
                )}
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
            {isLoggedIn ? (
              <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors">
                Mon Compte
              </a>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true)
                  setAuthMode("login")
                }}
                className="px-6 py-2 font-semibold bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-md transition-colors"
              >
                Se Connecter
              </button>
            )}
          </nav>
        </div>
      </header>

      <div className="pt-[108px]">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Tous les Candidats</h1>
            <p className="text-yellow-500 font-semibold">NB Dance Awards 2026 - 07 Février 2026 à 19h</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-center">Catégories</h2>
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex md:flex-wrap md:justify-center gap-2 md:gap-3 min-w-max md:min-w-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category
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

          <div className="mb-8 md:mb-12">
            <div className="relative max-w-2xl mx-auto">
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
              {filteredCandidates.map((candidate, index) => (
                <button
                  key={index}
                  onClick={() => handleCandidateClick(candidate)}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="relative mb-3 md:mb-4">
                    <div className="relative h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-full border-[3px] md:border-4 border-yellow-500 md:ring-4 md:ring-yellow-500/20">
                      <Image
                        src={candidate.image || "/placeholder.svg"}
                        alt={candidate.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {candidate.badge && (
                      <div className="absolute -top-1 -right-1 md:-bottom-1 md:-right-1 md:top-auto flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-pink-500 text-xs font-bold">
                        {candidate.badge}
                      </div>
                    )}
                  </div>

                  <h3 className="mb-1 md:mb-2 text-center text-sm md:text-base font-semibold">{candidate.name}</h3>

                  <span className="mb-2 px-2 py-0.5 text-[10px] md:text-xs bg-yellow-500/20 text-yellow-500 rounded-full">
                    {candidate.category}
                  </span>

                  <div className="w-full max-w-[100px] md:max-w-none">
                    <div className="mb-1.5 md:mb-2 h-1 md:h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-yellow-500 transition-all duration-300"
                        style={{ width: `${candidate.percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] md:text-xs text-zinc-400">
                      <span className="font-semibold text-white">{candidate.votes.toLocaleString()}</span>
                      <span>{candidate.percentage}%</span>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-zinc-500 text-center mt-0.5 md:mt-1">votes</p>
                  </div>
                </button>
              ))}
            </div>
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

      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-zinc-800 p-0">
          <div className="p-6 md:p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="relative h-16 w-16 mb-4">
                <Image src="/logo.png" alt="NB Dance Award" fill className="object-contain" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {authMode === "login" ? "Connexion" : "Inscription"}
              </h2>
              <p className="text-sm text-zinc-400 text-center">
                {authMode === "login"
                  ? "Connectez-vous pour voter pour vos danseurs préférés"
                  : "Créez un compte pour commencer à voter"}
              </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {authMode === "register" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Nom Complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <Input
                      type="text"
                      placeholder="Entrez votre nom"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-4 py-5 text-base text-white placeholder:text-zinc-500 focus:border-yellow-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">Email ou Téléphone</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="exemple@email.com ou +237 6xx xxx xxx"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-4 py-5 text-base text-white placeholder:text-zinc-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Mot de Passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-4 py-5 text-base text-white placeholder:text-zinc-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              {authMode === "register" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Confirmer le Mot de Passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <Input
                      type="password"
                      placeholder="Confirmez votre mot de passe"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-10 pr-4 py-5 text-base text-white placeholder:text-zinc-500 focus:border-yellow-500"
                    />
                  </div>
                </div>
              )}

              {authMode === "login" && (
                <div className="flex justify-end">
                  <a href="#" className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors">
                    Mot de passe oublié?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-5 text-base rounded-lg"
              >
                {authMode === "login" ? "Se Connecter" : "S'inscrire"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#0a0a0a] px-4 text-zinc-400">OU</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-zinc-400">
                  {authMode === "login" ? "Vous n'avez pas de compte?" : "Vous avez déjà un compte?"}
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                    className="ml-2 font-semibold text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    {authMode === "login" ? "S'inscrire" : "Se Connecter"}
                  </button>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-4">
                <Shield className="h-4 w-4" />
                <span>Vos données sont protégées et sécurisées</span>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isVotingModalOpen} onOpenChange={setIsVotingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-zinc-800 p-0">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-4 md:p-6 border-r border-zinc-800">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Votre Vote</h2>

              {selectedCandidate && (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-3">
                      <div className="relative h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-full border-4 md:border-[6px] border-yellow-500 bg-gradient-to-br from-purple-500 to-pink-500 p-1 md:p-2">
                        <div className="relative h-full w-full overflow-hidden rounded-full">
                          <Image
                            src={selectedCandidate.image || "/placeholder.svg"}
                            alt={selectedCandidate.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-1 right-1 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-pink-500">
                        <Lock className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold mb-1">{selectedCandidate.name}</h3>
                    <p className="text-zinc-400 text-xs md:text-sm">{selectedCandidate.title}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-base md:text-lg font-semibold mb-3">Nombre de Votes</h3>
                    <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
                      <button
                        onClick={decrementVotes}
                        className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-zinc-700 hover:border-yellow-500 transition-colors"
                      >
                        <Minus className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                      <div className="text-3xl md:text-4xl font-bold w-16 md:w-20 text-center">{voteCount}</div>
                      <button
                        onClick={incrementVotes}
                        className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-zinc-700 hover:border-yellow-500 transition-colors"
                      >
                        <Plus className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    </div>

                    <div className="text-center space-y-0.5">
                      <p className="text-xs md:text-sm font-semibold">1 Vote = 105 XAF.</p>
                      <p className="text-xs md:text-sm text-zinc-400">Minimum 5 votes.</p>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 md:py-5 text-sm md:text-base rounded-full uppercase">
                    Proceed to payment
                  </Button>
                </>
              )}
            </div>

            <div className="p-4 md:p-6 bg-zinc-900/50">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Paiement Sécurisé</h2>

              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
                <button
                  onClick={() => setSelectedPaymentMethod("mobile")}
                  className={`flex flex-col items-center gap-1 md:gap-2 p-2 md:p-3 rounded-lg border-2 transition-all ${
                    selectedPaymentMethod === "mobile"
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-orange-500">
                    <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <span className="text-[10px] md:text-xs text-center font-medium leading-tight">Mobile Money</span>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod("orange")}
                  className={`flex flex-col items-center gap-1 md:gap-2 p-2 md:p-3 rounded-lg border-2 transition-all ${
                    selectedPaymentMethod === "orange"
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-orange-500">
                    <span className="text-lg md:text-xl font-bold text-white">OM</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-center font-medium leading-tight">Orange Money</span>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod("bank")}
                  className={`flex flex-col items-center gap-1 md:gap-2 p-2 md:p-3 rounded-lg border-2 transition-all ${
                    selectedPaymentMethod === "bank"
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-orange-500">
                    <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <span className="text-[10px] md:text-xs text-center font-medium leading-tight">Virement / Carte</span>
                </button>
              </div>

              <div className="mb-4 md:mb-6 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 p-3 text-center text-sm md:text-base font-semibold">
                {selectedPaymentMethod === "mobile"
                  ? "Mobile Money"
                  : selectedPaymentMethod === "orange"
                    ? "Orange Money"
                    : "Virement Bancaire / Carte"}
              </div>

              <div className="mb-4 md:mb-6">
                <label className="mb-1.5 md:mb-2 block text-xs md:text-sm font-medium">
                  Sélectionnez le Fournisseur
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-white focus:border-yellow-500 focus:outline-none"
                >
                  {selectedPaymentMethod === "mobile" && (
                    <>
                      <option value="mtn-momo-cameroon">MTN MoMo (Cameroun)</option>
                      <option value="orange-money-cameroon">Orange Money (Cameroun)</option>
                      <option value="airtel-cameroon">Airtel Money (Cameroun)</option>
                    </>
                  )}
                  {selectedPaymentMethod === "orange" && (
                    <>
                      <option value="orange-money-cameroon">Orange Money (Cameroun)</option>
                    </>
                  )}
                  {selectedPaymentMethod === "bank" && (
                    <>
                      <option value="bank-transfer-cameroon">Virement Bancaire (Cameroun)</option>
                      <option value="visa-mastercard-cameroon">Visa / Mastercard (Cameroun)</option>
                      <option value="express-union-cameroon">Express Union (Cameroun)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="mb-4 md:mb-6">
                <div className="rounded-lg bg-zinc-800 px-3 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium">
                  Total Votes: {voteCount}
                </div>
              </div>

              <div className="mb-6 md:mb-8">
                <label className="mb-1.5 md:mb-2 block text-sm font-medium">Numéro de Téléphone</label>
                <div className="relative">
                  <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 md:gap-2">
                    <span className="text-lg md:text-xl">🇨🇲</span>
                    <span className="text-xs md:text-sm text-zinc-400">+237</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="6xx xxx xxx"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-20 md:pl-24 pr-10 md:pr-12 py-4 md:py-5 text-sm md:text-base text-white placeholder:text-zinc-500 focus:border-yellow-500"
                  />
                  <Lock className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-zinc-500" />
                </div>
              </div>

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
