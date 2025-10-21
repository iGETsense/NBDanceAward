"use client"

import { Shield, Users, Award, CheckCircle2, Target, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, User, Mail } from "lucide-react"

export default function ReglesPage() {
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

  const mainCategories = [
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

  const honoraryPrizes = [
    "Best inspiration pour la jeunesse",
    "Best soutien pour la jeunesse",
    "Prix d'encouragements (discipline & travail des danseurs)",
  ]

  const criteria = [
    "Être jeune passionné de danse et actif",
    "Être de nationalité Camerounaise",
    "Être sur les réseaux sociaux",
    "Vivre sur le territoire camerounais",
  ]

  const targetAudience = [
    "Danseurs, chorégraphes, créateurs de contenus",
    "Jeunesse passionnée par la culture et l'art urbain",
    "Médias, influenceurs et partenaires institutionnels",
    "Entreprises et marques souhaitant toucher un public jeune et dynamique",
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Banner */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-black py-3 text-center text-sm tracking-[0.3em] text-white font-light shadow-xl transition-all duration-300 ${
          showBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        NB COMPANY PRESENTE
      </div>

      {/* Header */}
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
                <span className="text-white">NB Dance</span>
                <span className="text-purple-500">Award</span>
              </div>
            </div>
          </Link>

          {/* Mobile Menu */}
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
                  className="px-4 py-3 text-base font-medium text-white hover:bg-zinc-800 rounded-lg transition-colors"
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/" className="text-zinc-400 hover:text-purple-400 transition-colors">
              Accueil
            </Link>
            <Link href="/candidats" className="text-zinc-400 hover:text-purple-400 transition-colors">
              Candidats
            </Link>
            <Link href="/regles" className="text-white hover:text-purple-400 transition-colors">
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
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-zinc-900/50 to-[#0a0a0a]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-500">NB Dance Awards 2026</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
                Règles et Critères de Nomination
              </h1>
              <p className="text-lg md:text-xl text-zinc-300 mb-4">07 Février 2026 à 19h</p>
              <p className="text-base md:text-lg text-zinc-400 max-w-3xl mx-auto">
                Organisé par <span className="text-yellow-500 font-semibold">Nb Company</span> et{" "}
                <span className="text-yellow-500 font-semibold">Mouvement des danseurs du Cameroun</span>
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 md:py-16 border-t border-zinc-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">À Propos de l'Événement</h2>
                  <p className="text-zinc-300 leading-relaxed mb-4">
                    <strong className="text-white">Nb Company</strong> et{" "}
                    <strong className="text-white">Mouvement des danseurs du Cameroun</strong> sont des jeunes
                    Camerounais passionnés de la danse et de la culture camerounaise, qui ont décidé ensemble de créer
                    cette opportunité pour les danseurs et danseuses, une manière pour nous de valoriser leur travail.
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    Une cérémonie prestigieuse qui célèbre et récompense l'excellence dans la danse, la créativité et
                    l'impact culturel. Cet événement vise à valoriser les danseurs et danseuses, mettre en lumière la
                    culture urbaine et traditionnelle au travers de la danse, et offrir une plateforme médiatique pour
                    la jeunesse. Elle se déroulera après chaque 1 ans.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16 bg-zinc-900/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Liste des Catégories</h2>
                  <p className="text-zinc-400">13 catégories principales + 3 prix honorifiques</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-yellow-500">Catégories Principales</h3>
                  <ul className="space-y-3">
                    {mainCategories.map((category, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{category}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-pink-500">Prix Honorifiques</h3>
                  <ul className="space-y-3">
                    {honoraryPrizes.map((prize, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{prize}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Criteria Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Critères de Nomination Générale</h2>
                  <p className="text-zinc-400">Conditions requises pour participer</p>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-6 md:p-8 border border-zinc-800">
                <ul className="space-y-4">
                  {criteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <span className="text-zinc-200 text-lg">{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="py-12 md:py-16 bg-zinc-900/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Public Cible</h2>
                  <p className="text-zinc-400">Qui peut participer et voter</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {targetAudience.map((audience, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800 hover:border-blue-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                      <p className="text-zinc-200">{audience}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16 border-t border-zinc-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Besoin d'Aide?</h2>
              <p className="text-zinc-400 mb-6">
                Pour toute question concernant les règles ou les critères de nomination, contactez-nous
              </p>
              <a
                href="mailto:NBCOMPANYENT@GMAIL.COM"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold transition-all"
              >
                <Mail className="h-5 w-5" />
                NBCOMPANYENT@GMAIL.COM
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-8">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-6 text-sm text-zinc-400 md:gap-8">
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
                <Link href="/candidats" className="hover:text-white transition-colors">
                  Candidats
                </Link>
                <Link href="/classement" className="hover:text-white transition-colors">
                  Classement
                </Link>
              </div>

              <div className="flex items-center gap-6">
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.047 1.024.06 1.379.06 3.808v.63c0 2.43-.013 2.784-.06 3.808-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 4.041v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
              </div>

              <p className="text-sm text-zinc-500">© 2026 NB Dance Awards. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Login/Register Modal */}
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
    </div>
  )
}
