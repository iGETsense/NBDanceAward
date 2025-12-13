"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, LogOut, TrendingUp, Users, DollarSign, Eye, EyeOff, Download, Wallet, ArrowUpRight, Filter, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useCandidates } from "@/hooks/useFirebaseData"
import { sanitizeInput, validateNumeric, validateWithdrawalData, RateLimiter } from "@/lib/security"
import { AdminStats, TransactionsList } from "@/components/AdminDashboard"
import { AdminWithdrawal } from "@/components/AdminWithdrawal"
import { FailedTransactions } from "@/components/FailedTransactions"
import { AdminTutorial } from "@/components/AdminTutorial"
import { AdminIssues } from "@/components/AdminIssues"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth"

export default function AdminPage() {
  const [showBanner, setShowBanner] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories")
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTime, setLockTime] = useState(0)
  const [securityError, setSecurityError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  // Authorized admin UID
  const ADMIN_UID = "He7g6275fIV459UbdKySfa5v5zJ3"

  const { candidates } = useCandidates()

  // Tutorial check
  useEffect(() => {
    const hasSeen = localStorage.getItem('nb_admin_tutorial_seen')
    if (!hasSeen) {
      setTimeout(() => setShowTutorial(true), 1500)
    }
  }, [])

  // Security: Rate limiter for login attempts
  const loginLimiter = new RateLimiter(5, 300000) // 5 attempts per 5 minutes

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid === ADMIN_UID) {
        setCurrentUser(user)
        setIsAuthenticated(true)
        localStorage.setItem("nbAdminAuth", "true")
        setSecurityError("")
      } else if (user) {
        // User is signed in but not authorized
        setSecurityError("Accès non autorisé. Vous n'êtes pas administrateur.")
        signOut(auth)
        setIsAuthenticated(false)
        setCurrentUser(null)
      } else {
        // User is signed out
        setIsAuthenticated(false)
        setCurrentUser(null)
        localStorage.removeItem("nbAdminAuth")
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    // Security: Check rate limiting
    if (isLocked) {
      const now = Date.now()
      const timeRemaining = Math.ceil((lockTime - now) / 1000)
      if (timeRemaining > 0) {
        setSecurityError(`Compte verrouillé. Réessayez dans ${timeRemaining}s`)
        return
      } else {
        setIsLocked(false)
        setLoginAttempts(0)
        setSecurityError("")
      }
    }

    if (!emailInput || !passwordInput) {
      setSecurityError("Veuillez entrer votre email et mot de passe")
      return
    }

    setIsLoading(true)
    setSecurityError("")

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput)
      const user = userCredential.user

      // Check if user is authorized admin
      if (user.uid !== ADMIN_UID) {
        setSecurityError("Accès non autorisé. Vous n'êtes pas administrateur.")
        await signOut(auth)
        setLoginAttempts(prev => prev + 1)
      } else {
        // Success - onAuthStateChanged will handle the rest
        setEmailInput("")
        setPasswordInput("")
        setLoginAttempts(0)
      }
    } catch (error: any) {
      // Track failed attempts
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)

      if (newAttempts >= 5) {
        setIsLocked(true)
        setLockTime(Date.now() + 300000) // Lock for 5 minutes
        setSecurityError("Trop de tentatives. Compte verrouillé pour 5 minutes.")
        console.warn(`[SECURITY] Admin login locked after ${newAttempts} failed attempts`)
      } else {
        // Firebase error messages
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          setSecurityError(`Email ou mot de passe incorrect. ${5 - newAttempts} tentatives restantes.`)
        } else if (error.code === 'auth/user-not-found') {
          setSecurityError(`Utilisateur non trouvé. ${5 - newAttempts} tentatives restantes.`)
        } else if (error.code === 'auth/too-many-requests') {
          setSecurityError("Trop de tentatives. Réessayez plus tard.")
        } else {
          setSecurityError(`Erreur de connexion: ${error.message}`)
        }
      }
      console.error('[ERROR] Firebase login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setIsAuthenticated(false)
      setCurrentUser(null)
      localStorage.removeItem("nbAdminAuth")
    } catch (error) {
      console.error('[ERROR] Logout failed:', error)
    }
  }




  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0)
  const totalRevenue = totalVotes * 5 // 5 per vote
  const topCandidate = candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]

  const filteredCandidates = candidates
    .filter((c) => {
      const matchesSearch = (c?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "Toutes les catégories" || (c?.category || '') === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => (b?.votes || 0) - (a?.votes || 0))

  const categories = ["Toutes les catégories", ...new Set(candidates.map((c) => c.category))]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="relative h-16 w-16">
                <Image src="/logo.png" alt="NB Dance Awards" fill className="object-contain" sizes="64px" priority loading="eager" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-2">
              <span className="text-white">NB</span>
              <span className="text-yellow-500"> Admin</span>
            </h1>
            <p className="text-center text-zinc-400 mb-8">Tableau de bord administrateur</p>

            {securityError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{securityError}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isLocked && !isLoading && handleLogin()}
                  placeholder="admin@example.com"
                  className="w-full bg-zinc-800 border-zinc-700 text-white"
                  disabled={isLocked || isLoading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Mot de passe</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isLocked && !isLoading && handleLogin()}
                    placeholder="••••••••"
                    className="w-full bg-zinc-800 border-zinc-700 text-white pr-10"
                    disabled={isLocked || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLocked || isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLocked ? "Compte verrouillé" : isLoading ? "Connexion..." : "Connexion"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Banner */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-black py-3 text-center text-sm tracking-[0.3em] text-white font-light shadow-xl transition-all duration-300 ${showBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      >
        NB DANCE AWARDS - ADMIN
      </div>

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-[#0a0a0a] transition-all duration-300"
        style={{ marginTop: showBanner ? "48px" : "0" }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image src="/logo.png" alt="NB Dance Awards" fill className="object-contain" sizes="(max-width: 768px) 40px, 48px" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:gap-1">
              <span className="text-xs font-bold leading-tight text-white md:hidden">
                NB DANCE
                <br />
                ADMIN
              </span>
              <div className="hidden md:flex items-center gap-1 text-xl font-bold">
                <span className="text-white">NB</span>
                <span className="text-yellow-500">Admin</span>
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
                    <Image src="/logo.png" alt="NB Dance Awards" fill className="object-contain" sizes="48px" />
                  </div>
                  <SheetTitle className="text-left">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">NB DANCE</span>
                      <span className="text-sm font-bold text-white">ADMIN</span>
                    </div>
                  </SheetTitle>
                </div>
              </SheetHeader>

              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setShowTutorial(true)
                  }}
                  className="px-4 py-3 text-base font-medium text-yellow-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <AlertCircle className="h-5 w-5" />
                  Guide Admin
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Déconnexion
                </button>
              </nav>
            </SheetContent>
          </Sheet>

          <button
            onClick={() => setShowTutorial(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-yellow-500/20"
          >
            <AlertCircle className="h-4 w-4" />
            Guide
          </button>

          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          {/* Enhanced KPI Cards with Real-time Transaction Data */}
          <AdminStats />

          {/* Real-time Transactions List */}
          <div className="mb-8">
            <TransactionsList />
          </div>

          {/* Failed Transactions - Need Review */}
          <div className="mb-8">
            <FailedTransactions />
          </div>

          {/* Withdrawal Section - New Component with Mesomb Integration */}
          <div className="mb-8">
            {/* Withdrawal Section */}
            <AdminWithdrawal />
          </div>

          {/* Support / Issues Section */}
          <div className="mb-8">
            <AdminIssues />
          </div>

          {/* Candidates Monitoring */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Suivi des Votes par Candidat</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-zinc-800 border-zinc-700 text-white text-sm"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 sm:px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Candidates Table */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-zinc-700">
                      <th className="text-left py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">Candidat</th>
                      <th className="text-left py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">Catégorie</th>
                      <th className="text-right py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">Votes</th>
                      <th className="text-right py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((candidate, index) => (
                      <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3 sm:py-4 px-3 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden border border-yellow-500/50 flex-shrink-0">
                              <Image
                                src={candidate.image || "/placeholder.svg"}
                                alt={candidate.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="font-medium text-white text-xs sm:text-sm whitespace-nowrap">{candidate.name}</span>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-zinc-400 text-xs sm:text-sm">
                          <span className="line-clamp-2">{candidate.category}</span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-right">
                          <span className="font-bold text-yellow-500 text-xs sm:text-sm whitespace-nowrap">{candidate.votes || 0}</span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <div className="w-12 sm:w-16 h-2 bg-zinc-700 rounded-full overflow-hidden flex-shrink-0">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all"
                                style={{ width: `${candidate.percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-xs sm:text-sm text-zinc-400 w-6 sm:w-8 text-right whitespace-nowrap">{candidate.percentage || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>



      <AdminTutorial open={showTutorial} onOpenChange={setShowTutorial} />
    </div>
  )
}
