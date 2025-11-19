"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, Search, TrendingUp, Users, Award, Globe, Zap, Shield, BarChart3, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export default function SEOPage() {
  const [showBanner, setShowBanner] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowBanner(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const seoMetrics = [
    {
      icon: TrendingUp,
      title: "Optimisation SEO",
      description: "Métadonnées complètes, Open Graph, et structured data pour une meilleure visibilité",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: Globe,
      title: "Couverture Mondiale",
      description: "Indexé par Google, Bing, et Yandex avec support multilingue",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Zap,
      title: "Performance Rapide",
      description: "Core Web Vitals optimisés pour un meilleur classement",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Shield,
      title: "Sécurité Maximale",
      description: "HTTPS, CSP, et protection contre les attaques web",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Users,
      title: "Expérience Utilisateur",
      description: "Design responsive et interface intuitive pour tous les appareils",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: BarChart3,
      title: "Analytics Avancés",
      description: "Google Analytics 4 et Google Tag Manager intégrés",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ]

  const seoFeatures = [
    "Titre et description optimisés pour les moteurs de recherche",
    "Mots-clés ciblés: danse africaine, vote en ligne, concours de danse",
    "Sitemap XML pour une meilleure indexation",
    "Robots.txt configuré pour les crawlers",
    "Open Graph tags pour le partage social",
    "Twitter Card pour les partages Twitter/X",
    "Structured data (Schema.org) pour les résultats enrichis",
    "Favicon et icônes pour toutes les plateformes",
    "Mobile-first responsive design",
    "Compression GZIP et optimisation des images",
    "Canonical URLs pour éviter le contenu dupliqué",
    "Métadonnées complètes pour Google, Bing, et Yandex",
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Banner */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-black py-3 text-center text-sm tracking-[0.3em] text-white font-light shadow-xl transition-all duration-300 ${
          showBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        NB DANCE AWARDS - SEO OPTIMISÉ
      </div>

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-[#0a0a0a] transition-all duration-300"
        style={{ marginTop: showBanner ? "48px" : "0" }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image src="/logo.png" alt="NB Dance Awards" fill className="object-contain" />
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
              <button className="md:hidden">
                <Menu className="h-6 w-6 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-[#0a0a0a] border-zinc-800">
              <SheetHeader className="mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12">
                    <Image src="/logo.png" alt="NB Dance Awards" fill className="object-contain" />
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
                <Link
                  href="/candidats"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Candidats
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

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Accueil
            </Link>
            <Link href="/candidats" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Candidats
            </Link>
            <Link href="/classement" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Classement
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 md:pt-28 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Hero Section */}
          <section className="mb-16 md:mb-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <Search className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-500">Optimisé pour les Moteurs de Recherche</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
                NB Dance Awards
                <br />
                <span className="text-yellow-500">Optimisation SEO Professionnelle</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                Découvrez comment notre plateforme est optimisée pour les moteurs de recherche et offre la meilleure expérience utilisateur possible.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-lg transition-all">
                    Retour à l'Accueil
                  </Button>
                </Link>
                <Link href="/candidats">
                  <Button className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-8 py-3 rounded-lg transition-all border border-zinc-700">
                    Voir les Candidats
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* SEO Metrics */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Nos Forces SEO</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seoMetrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6 hover:border-yellow-500/50 transition-colors"
                  >
                    <div className={`${metric.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{metric.title}</h3>
                    <p className="text-sm text-zinc-400">{metric.description}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* SEO Features */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Fonctionnalités SEO</h2>

            <div className="max-w-3xl mx-auto bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seoFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Search Engines */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Indexé par les Principaux Moteurs</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Google", icon: "🔍", description: "Indexé et optimisé pour Google Search" },
                { name: "Bing", icon: "🔎", description: "Présent dans Bing Webmaster Tools" },
                { name: "Yandex", icon: "🌐", description: "Optimisé pour les marchés russes et CIS" },
              ].map((engine, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6 text-center hover:border-yellow-500/50 transition-colors"
                >
                  <div className="text-4xl mb-4">{engine.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{engine.name}</h3>
                  <p className="text-sm text-zinc-400">{engine.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Keywords */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Mots-Clés Ciblés</h2>

            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    "NB Dance Awards",
                    "Danse Africaine",
                    "Vote en Ligne",
                    "Coupé Décalé",
                    "Mbolé",
                    "Concours de Danse",
                    "Superstar Danse",
                    "Danseur Camerounais",
                    "Classement Danse",
                    "Élection Danseur",
                    "Danse Cameroun",
                    "Concours Afrique",
                  ].map((keyword, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center"
                    >
                      <p className="text-sm font-medium text-yellow-500">{keyword}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mb-16">
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-8 md:p-12 text-center">
              <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Prêt à Voter?</h2>
              <p className="text-zinc-300 mb-6">
                Découvrez nos 67 candidats exceptionnels et votez pour votre danseur préféré. Classement en temps réel!
              </p>
              <Link href="/candidats">
                <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-lg transition-all">
                  Voir les Candidats
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">NB Dance Awards</h3>
              <p className="text-sm text-zinc-400">Plateforme de vote pour les meilleurs talents de danse africaine.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/" className="hover:text-yellow-500 transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/candidats" className="hover:text-yellow-500 transition-colors">
                    Candidats
                  </Link>
                </li>
                <li>
                  <Link href="/classement" className="hover:text-yellow-500 transition-colors">
                    Classement
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/regles" className="hover:text-yellow-500 transition-colors">
                    Règles
                  </Link>
                </li>
                <li>
                  <Link href="/seo" className="hover:text-yellow-500 transition-colors">
                    SEO
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <p className="text-sm text-zinc-400">NBCOMPANYENT@GMAIL.COM</p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 text-center text-sm text-zinc-400">
            <p>&copy; 2025 NB Dance Awards. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
