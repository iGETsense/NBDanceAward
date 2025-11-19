"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, LogOut, TrendingUp, Users, DollarSign, Eye, EyeOff, Download, Wallet, ArrowUpRight, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useCandidates } from "@/hooks/useFirebaseData"

export default function AdminPage() {
  const [showBanner, setShowBanner] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [withdrawalMethod, setWithdrawalMethod] = useState("om")
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([])

  const { candidates } = useCandidates()

  // Mock admin password (in production, use proper authentication)
  const ADMIN_PASSWORD = "NB2024Admin"

  useEffect(() => {
    const stored = localStorage.getItem("nbAdminAuth")
    if (stored) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("nbAdminAuth", "true")
      setPasswordInput("")
    } else {
      alert("Mot de passe incorrect")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("nbAdminAuth")
  }

  const handleWithdrawal = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      alert("Veuillez entrer un montant valide")
      return
    }

    const withdrawal = {
      id: Date.now(),
      amount: parseFloat(withdrawalAmount),
      method: withdrawalMethod,
      date: new Date().toLocaleDateString("fr-FR"),
      time: new Date().toLocaleTimeString("fr-FR"),
      status: "Complété",
    }

    setWithdrawalHistory([withdrawal, ...withdrawalHistory])
    setWithdrawalAmount("")
    setShowWithdrawalModal(false)
  }

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0)
  const totalRevenue = totalVotes * 5 // 5 per vote
  const topCandidate = candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]

  const filteredCandidates = candidates
    .filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "Toutes les catégories" || c.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))

  const categories = ["Toutes les catégories", ...new Set(candidates.map((c) => c.category))]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="relative h-16 w-16">
                <Image src="/logo.png" alt="NB Dance Awards" fill className="object-contain" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-2">
              <span className="text-white">NB</span>
              <span className="text-yellow-500"> Admin</span>
            </h1>
            <p className="text-center text-zinc-400 mb-8">Tableau de bord administrateur</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Mot de passe</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Entrez le mot de passe"
                    className="w-full bg-zinc-800 border-zinc-700 text-white pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-2 rounded-lg transition-all"
              >
                Connexion
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
        className={`fixed top-0 left-0 right-0 z-50 bg-black py-3 text-center text-sm tracking-[0.3em] text-white font-light shadow-xl transition-all duration-300 ${
          showBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
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
              <Image src="/logo.png" alt="NB Dance Awards" fill className="object-contain" />
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
                    <Image src="/logo.png" alt="NB Dance Awards" fill className="object-contain" />
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
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 md:pt-28 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Votes */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6 hover:border-yellow-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Total des Votes</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">{totalVotes.toLocaleString()}</h3>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <ArrowUpRight className="h-4 w-4" />
                <span>En temps réel</span>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6 hover:border-yellow-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Revenu Total</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">{totalRevenue.toLocaleString()} XAF</h3>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <p className="text-zinc-400 text-xs">5 XAF par vote</p>
            </div>

            {/* Total Candidates */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6 hover:border-yellow-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Candidats</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">{candidates.length}</h3>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="text-zinc-400 text-xs">Actifs</p>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wallet className="h-6 w-6 text-yellow-500" />
                Gestion des Retraits
              </h2>
              <Button
                onClick={() => setShowWithdrawalModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-6 py-2 rounded-lg transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Effectuer un Retrait
              </Button>
            </div>

            {/* Withdrawal History */}
            <div className="space-y-3">
              {withdrawalHistory.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">Aucun retrait effectué</p>
              ) : (
                withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{withdrawal.amount.toLocaleString()} XAF</p>
                      <p className="text-sm text-zinc-400">
                        {withdrawal.method === "om" ? "Orange Money" : "MTN MoMo"} • {withdrawal.date} {withdrawal.time}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">{withdrawal.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Candidates Monitoring */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Suivi des Votes par Candidat</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Rechercher un candidat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:border-yellow-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Candidates Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Candidat</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Catégorie</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-semibold">Votes</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-semibold">Revenu</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-semibold">%</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate, index) => (
                    <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-yellow-500/50">
                            <Image
                              src={candidate.image || "/placeholder.svg"}
                              alt={candidate.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium text-white">{candidate.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-zinc-400 text-sm">{candidate.category}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-yellow-500">{candidate.votes || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-green-400">{((candidate.votes || 0) * 5).toLocaleString()} XAF</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all"
                              style={{ width: `${candidate.percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-zinc-400 w-8 text-right">{candidate.percentage || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Effectuer un Retrait</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Montant (XAF)</label>
                <Input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Entrez le montant"
                  className="w-full bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Méthode de Retrait</label>
                <select
                  value={withdrawalMethod}
                  onChange={(e) => setWithdrawalMethod(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2"
                >
                  <option value="om">Orange Money</option>
                  <option value="momo">MTN MoMo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleWithdrawal}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-lg py-2"
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
