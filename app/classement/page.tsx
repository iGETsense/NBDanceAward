"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Crown, Menu, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useCandidates } from "@/hooks/useFirebaseData"
import { Input } from "@/components/ui/input"

// Static candidates for fallback
const staticRankedCandidates = [
    // Meilleur artiste danseur - masculin
    {
      name: "Étienne kampos",
      title: "Male Dance King",
      image: "/dancers/Etienne kampos.jpg",
      votes: 1847,
      totalVotes: 45000,
      percentage: 45,
      category: "Meilleur artiste danseur - masculin",
    },
    {
      name: "De Flow",
      title: "Flow Master",
      image: "/dancers/De Flow.jpeg",
      votes: 1654,
      totalVotes: 45000,
      percentage: 40,
      category: "Meilleur artiste danseur - masculin",
    },
    {
      name: "Pascal métaphore",
      title: "Poetic Dancer",
      image: "/dancers/PASCAL métaphore.jpeg",
      votes: 1432,
      totalVotes: 45000,
      percentage: 35,
      category: "Meilleur artiste danseur - masculin",
    },
    {
      name: "El Fally du 237",
      title: "Cameroon Star",
      image: "/dancers/El fally du 237.jpg",
      votes: 1289,
      totalVotes: 45000,
      percentage: 31,
      category: "Meilleur artiste danseur - masculin",
    },
    {
      name: "Escram shuwingum",
      title: "Smooth Performer",
      image: "/dancers/ESCRAM.jpeg",
      votes: 1156,
      totalVotes: 45000,
      percentage: 28,
      category: "Meilleur artiste danseur - masculin",
    },

    // Meilleure artiste danseuse féminine
    {
      name: "Maguy merine",
      title: "Dance Star",
      image: "/dancers/MAGUY MERINE.jpeg",
      votes: 2534,
      totalVotes: 45000,
      percentage: 62,
      category: "Meilleure artiste danseuse féminine",
    },
    {
      name: "Kendi",
      title: "Dance Performer",
      image: "/dancers/KENDI.jpeg",
      votes: 2245,
      totalVotes: 45000,
      percentage: 55,
      category: "Meilleure artiste danseuse féminine",
    },
    {
      name: "Beb's velina",
      title: "Talented Dancer",
      image: "/dancers/Beb’s vélina.jpeg",
      votes: 1956,
      totalVotes: 45000,
      percentage: 48,
      category: "Meilleure artiste danseuse féminine",
    },
    {
      name: "Katia eg",
      title: "Professional Artist",
      image: "/dancers/Katia EG.png",
      votes: 1723,
      totalVotes: 45000,
      percentage: 42,
      category: "Meilleure artiste danseuse féminine",
    },
    {
      name: "Stella officielle3",
      title: "Star Performer",
      image: "/dancers/Stella Officielle3.jpeg",
      votes: 1567,
      totalVotes: 45000,
      percentage: 38,
      category: "Meilleure artiste danseuse féminine",
    },

    // Meilleur groupe de danse
    {
      name: "AFU Dance académie",
      title: "Professional Group",
      image: "/dancers/AFU DANCE ACADEMY STUDIO.jpeg",
      votes: 2089,
      totalVotes: 45000,
      percentage: 51,
      category: "Meilleur groupe de danse",
    },
    {
      name: "Etat NWAR dance",
      title: "Dance Collective",
      image: "/dancers/ÉTAT NWAR DANCE SCHOOL.jpg",
      votes: 1834,
      totalVotes: 45000,
      percentage: 45,
      category: "Meilleur groupe de danse",
    },
    {
      name: "Team Escram",
      title: "Dance Crew",
      image: "/dancers/TEAM ESCRAM.jpeg",
      votes: 1689,
      totalVotes: 45000,
      percentage: 41,
      category: "Meilleur groupe de danse",
    },
    {
      name: "Mbolé Dancing",
      title: "Cultural Group",
      image: "/dancers/Mbole Dancing.jpeg",
      votes: 1445,
      totalVotes: 45000,
      percentage: 35,
      category: "Meilleur groupe de danse",
    },

    // Meilleur collaboration duo
    {
      name: "Déboy le monstre et Maguy merine",
      title: "Monster & Queen",
      image: "/dancers/DEBOY LE MONSTRE.jpeg",
      votes: 1956,
      totalVotes: 45000,
      percentage: 48,
      category: "Meilleur collaboration duo",
    },
    {
      name: "4 peace et Rachel élégance",
      title: "Peace & Elegance",
      image: "/dancers/4 peace.jpeg",
      votes: 1723,
      totalVotes: 45000,
      percentage: 42,
      category: "Meilleur collaboration duo",
    },
    {
      name: "Chica bassa et kendi",
      title: "Chica & Kendi",
      image: "/dancers/CHICA BASSA.jpeg",
      votes: 1567,
      totalVotes: 45000,
      percentage: 38,
      category: "Meilleur collaboration duo",
    },
    {
      name: "Tks officiel et Trésor brown",
      title: "TKS & Treasure",
      image: "/dancers/TKS OFFICIEL.jpg",
      votes: 1432,
      totalVotes: 45000,
      percentage: 35,
      category: "Meilleur collaboration duo",
    },
    {
      name: "El fally du 237 et davia off",
      title: "Fally & Davia",
      image: "/dancers/El fally du 237.jpg",
      votes: 1298,
      totalVotes: 45000,
      percentage: 32,
      category: "Meilleur collaboration duo",
    },

    // Meilleur artiste Chorégraphe
    {
      name: "Accadien fureur",
      title: "Arcadian Choreographer",
      image: "/dancers/Accadient Fureur.jpeg",
      votes: 2245,
      totalVotes: 45000,
      percentage: 55,
      category: "Meilleur artiste Chorégraphe",
    },
    {
      name: "Goldy lastar",
      title: "Golden Star",
      image: "/dancers/GOLDY LA-STAR.jpeg",
      votes: 2089,
      totalVotes: 45000,
      percentage: 51,
      category: "Meilleur artiste Chorégraphe",
    },
    {
      name: "Garçon déterminé",
      title: "Determined Boy",
      image: "/dancers/Garçon déterminé.jpg",
      votes: 1834,
      totalVotes: 45000,
      percentage: 45,
      category: "Meilleur artiste Chorégraphe",
    },
    {
      name: "El Fally du 237",
      title: "Versatile Artist",
      image: "/dancers/El fally du 237.jpg",
      votes: 1689,
      totalVotes: 45000,
      percentage: 41,
      category: "Meilleur artiste Chorégraphe",
    },
    {
      name: "La religion noire",
      title: "Black Religion",
      image: "/dancers/religion  noir.JPG",
      votes: 1567,
      totalVotes: 45000,
      percentage: 38,
      category: "Meilleur artiste Chorégraphe",
    },

    // Meilleur Performance web
    {
      name: "Kendi",
      title: "Web Star",
      image: "/dancers/KENDI.jpeg",
      votes: 3245,
      totalVotes: 45000,
      percentage: 79,
      category: "Meilleur Performance web",
    },
    {
      name: "Déboy le monstre",
      title: "Viral Sensation",
      image: "/dancers/DEBOY LE MONSTRE.jpeg",
      votes: 2834,
      totalVotes: 45000,
      percentage: 69,
      category: "Meilleur Performance web",
    },
    {
      name: "El fally 237",
      title: "Online Star",
      image: "/dancers/El fally du 237.jpg",
      votes: 2456,
      totalVotes: 45000,
      percentage: 60,
      category: "Meilleur Performance web",
    },
    {
      name: "Jkaxel",
      title: "Internet Performer",
      image: "/dancers/JKAXEL.jpg",
      votes: 2189,
      totalVotes: 45000,
      percentage: 53,
      category: "Meilleur Performance web",
    },
    {
      name: "Maguy merine",
      title: "Online Presence",
      image: "/dancers/MAGUY MERINE.jpeg",
      votes: 1967,
      totalVotes: 45000,
      percentage: 48,
      category: "Meilleur Performance web",
    },
    {
      name: "Jessi 237",
      title: "Digital Star",
      image: "/dancers/Jessi 237.jpeg",
      votes: 1789,
      totalVotes: 45000,
      percentage: 44,
      category: "Meilleur Performance web",
    },
    {
      name: "Étienne kampos",
      title: "Web Performer",
      image: "/dancers/Etienne kampos.jpg",
      votes: 1623,
      totalVotes: 45000,
      percentage: 40,
      category: "Meilleur Performance web",
    },
    {
      name: "Nelly Dora",
      title: "Online Artist",
      image: "/dancers/NELLY DORA.jpeg",
      votes: 1467,
      totalVotes: 45000,
      percentage: 36,
      category: "Meilleur Performance web",
    },
]

const mainCategories = [
  "Meilleure artiste danseuse féminine",
  "Meilleure artiste danseuse mbolé",
  "Meilleur artiste jeune danseur/danseuse",
  "Meilleur Performance web",
  "Meilleur Groupe de danse",
  "Meilleur artiste danseur Afro Coupé décalé",
  "Meilleur artiste danseur masculin",
  "meilleurs artiste danseurs mbolé",
  "meilleur artiste danse au rythme folklorique",
  "meilleurs danseur de l'année",
  "Meilleurs artiste chorégraphes",
  "meilleure artiste danseuse de l'année",
  "Meilleur collaboration duo",
]

const honoraryPrizes = ["Best inspiration pour la jeunesse", "Best soutien pour la jeunesse", "Prix d'encouragements"]

// Candidates with custom image positioning (for better head visibility)
const customImagePositioning: { [key: string]: string } = {
  "LMN ponce Off": "top",
  "Stella officielle3": "top",
  "Nelly Dora": "center",
  "Chica bassa": "center",
  "Influence Femi": "center",
  "Jessi 237": "center",
}

export default function ClassementPage() {
  // Firebase hook
  const { candidates: firebaseCandidates, loading: candidatesLoading } = useCandidates()
  
  // Use Firebase candidates if available, otherwise use static
  const rankedCandidates = firebaseCandidates.length > 0 ? firebaseCandidates : staticRankedCandidates

  const [showBanner, setShowBanner] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  useEffect(() => {
    const handleScroll = () => {
      setShowBanner(window.scrollY === 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getCandidatesByCategory = (category: string) => {
    return rankedCandidates.filter((c: any) => c.category === category).sort((a: any, b: any) => b.votes - a.votes)
  }

  const formatVotes = (votes: number) => {
    return votes.toLocaleString("fr-FR")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Banner */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-black py-3 text-center text-sm tracking-[0.3em] text-white font-light shadow-xl transition-transform duration-300 ${
          showBanner ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        NB DANCE AWARDS
      </div>

      {/* Header */}
      <header
        className={`fixed left-0 right-0 z-40 border-b border-zinc-800 bg-[#0a0a0a] transition-all duration-300 ${
          showBanner ? "top-[48px]" : "top-0"
        }`}
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

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-zinc-800">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-[#0a0a0a] border-zinc-800 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-zinc-800">
                  <div className="relative h-16 w-16 mx-auto mb-3">
                    <Image src="/logo.png" alt="NB Dance Award" fill className="object-contain" quality={90} sizes="64px" />
                  </div>
                  <h2 className="text-center text-lg font-bold text-yellow-500">NB DANCE AWARDS</h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Accueil
                  </Link>
                  <Link
                    href="/candidats"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Candidats
                  </Link>
                  <a
                    href="#"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Règles
                  </a>
                  <Link
                    href="/classement"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-white bg-zinc-800 rounded-lg transition-colors"
                  >
                    Classement
                  </Link>
                  {isLoggedIn ? (
                    <a
                      href="#"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      Mon Compte
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setShowAuthModal(true)
                      }}
                      className="w-full text-left px-4 py-3 text-base font-medium text-yellow-500 hover:text-yellow-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      Se Connecter
                    </button>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Accueil
            </Link>
            <Link href="/candidats" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Candidats
            </Link>
            <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Règles
            </a>
            <Link href="/classement" className="text-sm font-medium text-white transition-colors">
              Classement
            </Link>
            {isLoggedIn ? (
              <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Mon Compte
              </a>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6"
              >
                Se Connecter
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border-zinc-800 p-6 md:p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {authMode === "login" ? "Connexion" : "Inscription"}
              </h2>
              <p className="text-sm text-zinc-400">
                {authMode === "login"
                  ? "Connectez-vous pour voter pour vos danseurs préférés"
                  : "Créez un compte pour commencer à voter"}
              </p>
            </div>

            <div className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Nom Complet</label>
                  <Input
                    type="text"
                    placeholder="Entrez votre nom"
                    className="w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email ou Téléphone</label>
                <Input
                  type="text"
                  placeholder="exemple@email.com ou +237 6XX XXX XXX"
                  className="w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mot de Passe</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {authMode === "register" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmer le Mot de Passe</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
              )}

              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-6 text-base">
                {authMode === "login" ? "Se Connecter" : "S'inscrire"}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  {authMode === "login" ? "Pas encore de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Shield className="h-4 w-4" />
                <span>Connexion sécurisée SSL</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="pt-[120px] md:pt-[140px]">
        {/* Main Categories Rankings */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">CLASSEMENT PAR CATÉGORIE</h2>

            <div className="space-y-12 md:space-y-16">
              {mainCategories.map((category) => {
                const categoryCandidates = getCandidatesByCategory(category)

                if (categoryCandidates.length === 0) return null

                return (
                  <div key={category} className="space-y-6">
                    <div className="mb-6">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">{category}</h3>
                      <div className="h-1 w-20 bg-yellow-500 rounded-full"></div>
                    </div>

                    <div className="space-y-4 animate-stagger">
                      {categoryCandidates.map((candidate, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 md:gap-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 md:p-6 hover:bg-zinc-900/70 transition-all duration-300 animate-fade-in-left hover-lift"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {/* Rank Number */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-3 border-yellow-500 bg-zinc-900 flex items-center justify-center">
                              <span className="text-xl md:text-2xl font-bold text-yellow-500">{index + 1}</span>
                            </div>
                            {index === 0 && (
                              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5">
                                <Crown className="h-4 w-4 md:h-5 md:w-5 text-black" fill="currentColor" />
                              </div>
                            )}
                          </div>

                          {/* Profile Image */}
                          <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                            <div className="absolute inset-0 rounded-full border-3 border-yellow-500 overflow-hidden">
                              <Image
                                src={candidate.image || "/placeholder.svg"}
                                alt={candidate.name}
                                fill
                                className="object-cover"
                                style={{ objectPosition: `${customImagePositioning[candidate.name] || "top"} center` }}
                                loading="lazy"
                                quality={80}
                                sizes="(max-width: 768px) 64px, 80px"
                              />
                            </div>
                          </div>

                          {/* Candidate Info and Progress */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold mb-2 truncate">{candidate.name}</h3>

                            <div className="flex items-center justify-between gap-4 mb-2">
                              <span className="text-xs md:text-sm text-zinc-400">
                                {formatVotes(candidate.votes)} VOTES
                              </span>
                              <span className="text-xs md:text-sm font-semibold text-yellow-500">
                                {candidate.percentage}%
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 md:h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-500"
                                style={{ width: `${candidate.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex gap-8">
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  FAQ
                </a>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Support
                </a>
              </div>

              <div className="flex gap-6">
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.849 0-3.204.013-3.663.072-4.948.149-3.227 1.664-4.771 4.919-4.919 1.266-.059 1.69-.073 4.949-.073z" />
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93-.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
