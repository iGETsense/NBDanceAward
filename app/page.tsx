"use client"

import { Smartphone, CreditCard, Award, Menu, Minus, Plus, Lock, Shield, CheckCircle2, User, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"
import PartnersCarousel from "@/components/PartnersCarousel"

const candidates = [
  // Meilleur artiste danseur - masculin
  {
    name: "Étienne kampos",
    title: "Male Dance King",
    image: "/dancers/Etienne kampos.jpg",
    votes: 1847,
    badge: 1,
    percentage: 45,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "De Flow",
    title: "Flow Master",
    image: "/dancers/De Flow.jpeg",
    votes: 1654,
    badge: null,
    percentage: 40,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "Pascal métaphore",
    title: "Poetic Dancer",
    image: "/dancers/PASCAL métaphore.jpeg",
    votes: 1432,
    badge: null,
    percentage: 35,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "El Fally du 237",
    title: "Cameroon Star",
    image: "/dancers/El fally du 237.jpg",
    votes: 1289,
    badge: null,
    percentage: 31,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "Escram shuwingum",
    title: "Smooth Performer",
    image: "/dancers/ESCRAM.jpeg",
    votes: 1156,
    badge: null,
    percentage: 28,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "Petit tchakap",
    title: "Small but Mighty",
    image: "/dancers/petit tchakap.jpg",
    votes: 1089,
    badge: null,
    percentage: 26,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "3 peace",
    title: "Peace Trio",
    image: "/dancers/3 peace.jpeg",
    votes: 987,
    badge: null,
    percentage: 24,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "Jkaxel",
    title: "Urban Legend",
    image: "/dancers/JKAXEL.jpg",
    votes: 876,
    badge: null,
    percentage: 21,
    category: "Meilleur artiste danseur - masculin",
  },

  // Meilleure artiste danseuse féminine
  {
    name: "Maguy merine",
    title: "Dance Star",
    image: "/dancers/MAGUY MERINE.jpeg",
    votes: 2534,
    badge: 1,
    percentage: 62,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Kendi",
    title: "Dance Performer",
    image: "/dancers/KENDI.jpeg",
    votes: 2245,
    badge: 2,
    percentage: 55,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Beb's velina",
    title: "Talented Dancer",
    image: "/dancers/Beb’s vélina.jpeg",
    votes: 1956,
    badge: null,
    percentage: 48,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Katia eg",
    title: "Professional Artist",
    image: "/dancers/Katia EG.png",
    votes: 1723,
    badge: null,
    percentage: 42,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Stella officielle3",
    title: "Star Performer",
    image: "/dancers/Stella Officielle3.jpeg",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Nounours",
    title: "Dynamic Dancer",
    image: "/dancers/Nounours.jpeg",
    votes: 1423,
    badge: null,
    percentage: 35,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "O'konor Céleste",
    title: "Rising Star",
    image: "/dancers/O’konor Celeste.jpeg",
    votes: 1298,
    badge: null,
    percentage: 32,
    category: "Meilleure artiste danseuse féminine",
  },

  // Meilleur groupe de danse
  {
    name: "AFU Dance académie",
    title: "Professional Group",
    image: "/dancers/AFU DANCE ACADEMY STUDIO.jpeg",
    votes: 2089,
    badge: 1,
    percentage: 51,
    category: "Meilleur groupe de danse",
  },
  {
    name: "Etat NWAR dance",
    title: "Dance Collective",
    image: "/dancers/ÉTAT NWAR DANCE SCHOOL.jpg",
    votes: 1834,
    badge: null,
    percentage: 45,
    category: "Meilleur groupe de danse",
  },
  {
    name: "Team Escram",
    title: "Dance Crew",
    image: "/dancers/TEAM ESCRAM.jpeg",
    votes: 1689,
    badge: null,
    percentage: 41,
    category: "Meilleur groupe de danse",
  },
  {
    name: "Mbolé Dancing",
    title: "Cultural Group",
    image: "/dancers/Mbole Dancing.jpeg",
    votes: 1445,
    badge: null,
    percentage: 35,
    category: "Meilleur groupe de danse",
  },

  // Meilleur collaboration duo
  {
    name: "Déboy le monstre et Maguy merine",
    title: "Monster & Queen",
    image: "/dancers/DEBOY LE MONSTRE.jpeg",
    votes: 1956,
    badge: 1,
    percentage: 48,
    category: "Meilleur collaboration duo",
  },
  {
    name: "4 peace et Rachel élégance",
    title: "Peace & Elegance",
    image: "/dancers/4 peace.jpeg",
    votes: 1723,
    badge: null,
    percentage: 42,
    category: "Meilleur collaboration duo",
  },
  {
    name: "Chica bassa et kendi",
    title: "Chica & Kendi",
    image: "/dancers/CHICA BASSA.jpeg",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleur collaboration duo",
  },
  {
    name: "Tks officiel et Trésor brown",
    title: "TKS & Treasure",
    image: "/dancers/TKS OFFICIEL.jpg",
    votes: 1432,
    badge: null,
    percentage: 35,
    category: "Meilleur collaboration duo",
  },
  {
    name: "El fally du 237 et davia off",
    title: "Fally & Davia",
    image: "/dancers/El fally du 237.jpg",
    votes: 1298,
    badge: null,
    percentage: 32,
    category: "Meilleur collaboration duo",
  },
  {
    name: "O'konor Celeste et Katia_eg",
    title: "Celeste & Katia",
    image: "/dancers/O’konor Celeste.jpeg",
    votes: 1178,
    badge: null,
    percentage: 29,
    category: "Meilleur collaboration duo",
  },
  {
    name: "3 peace et Influence femi",
    title: "3Peace & Influence",
    image: "/dancers/3 peace.jpeg",
    votes: 1056,
    badge: null,
    percentage: 26,
    category: "Meilleur collaboration duo",
  },
  {
    name: "Jumeaux de la capitale",
    title: "Twin Stars",
    image: "/dancers/JUMAUX DE LA CAPITALE.jpg",
    votes: 945,
    badge: null,
    percentage: 23,
    category: "Meilleur collaboration duo",
  },

  // Meilleur artiste Chorégraphe
  {
    name: "Accadien fureur",
    title: "Arcadian Choreographer",
    image: "/dancers/Accadient Fureur.jpeg",
    votes: 2245,
    badge: 1,
    percentage: 55,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "Goldy lastar",
    title: "Golden Star",
    image: "/dancers/GOLDY LA-STAR.jpeg",
    votes: 2089,
    badge: null,
    percentage: 51,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "Garçon déterminé",
    title: "Determined Boy",
    image: "/dancers/Garçon déterminé.jpg",
    votes: 1834,
    badge: null,
    percentage: 45,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "El Fally du 237",
    title: "Versatile Artist",
    image: "/dancers/El fally du 237.jpg",
    votes: 1689,
    badge: null,
    percentage: 41,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "La religion noire",
    title: "Black Religion",
    image: "/dancers/religion  noir.JPG",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "Katia eg",
    title: "Female Choreographer",
    image: "/dancers/Katia EG.png",
    votes: 1445,
    badge: null,
    percentage: 35,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "Le Hempe",
    title: "Hemp Master",
    image: "/dancers/le hempe.jpg",
    votes: 1323,
    badge: null,
    percentage: 32,
    category: "Meilleur artiste Chorégraphe",
  },

  // Meilleur Performance web
  {
    name: "Kendi",
    title: "Web Star",
    image: "/dancers/KENDI.jpeg",
    votes: 3245,
    badge: 1,
    percentage: 79,
    category: "Meilleur Performance web",
  },
  {
    name: "Déboy le monstre",
    title: "Viral Sensation",
    image: "/dancers/DEBOY LE MONSTRE.jpeg",
    votes: 2834,
    badge: 2,
    percentage: 69,
    category: "Meilleur Performance web",
  },
  {
    name: "El fally 237",
    title: "Online Star",
    image: "/dancers/El fally du 237.jpg",
    votes: 2456,
    badge: null,
    percentage: 60,
    category: "Meilleur Performance web",
  },
  {
    name: "Jkaxel",
    title: "Internet Performer",
    image: "/dancers/JKAXEL.jpg",
    votes: 2189,
    badge: null,
    percentage: 53,
    category: "Meilleur Performance web",
  },
  {
    name: "Maguy merine",
    title: "Online Presence",
    image: "/dancers/MAGUY MERINE.jpeg",
    votes: 1967,
    badge: null,
    percentage: 48,
    category: "Meilleur Performance web",
  },
  {
    name: "Jessi 237",
    title: "Digital Star",
    image: "/dancers/Jessi 237.jpeg",
    votes: 1789,
    badge: null,
    percentage: 44,
    category: "Meilleur Performance web",
  },
  {
    name: "Étienne kampos",
    title: "Web Performer",
    image: "/dancers/Etienne kampos.jpg",
    votes: 1623,
    badge: null,
    percentage: 40,
    category: "Meilleur Performance web",
  },
  {
    name: "Nelly Dora",
    title: "Online Artist",
    image: "/dancers/NELLY DORA.jpeg",
    votes: 1467,
    badge: null,
    percentage: 36,
    category: "Meilleur Performance web",
  },
  {
    name: "Chica bassa",
    title: "Viral Artist",
    image: "/dancers/CHICA BASSA.jpeg",
    votes: 1323,
    badge: null,
    percentage: 32,
    category: "Meilleur Performance web",
  },
  {
    name: "Nounours",
    title: "Popular Online",
    image: "/dancers/Nounours.jpeg",
    votes: 1189,
    badge: null,
    percentage: 29,
    category: "Meilleur Performance web",
  },

  // Meilleure artiste danseur au rythme folklorique
  {
    name: "Ayi ventilateur",
    title: "Wind Master",
    image: "/dancers/ayi ventilateur.png",
    votes: 1834,
    badge: 1,
    percentage: 45,
    category: "Meilleure artiste danseur au rythme folklorique",
  },
  {
    name: "Nounours traditionnel",
    title: "Traditional Bear",
    image: "/dancers/le nounours traditionnel.jpeg",
    votes: 1689,
    badge: null,
    percentage: 41,
    category: "Meilleure artiste danseur au rythme folklorique",
  },
  {
    name: "Arcadien fureur",
    title: "Arcadian Fury",
    image: "/dancers/Accadient Fureur.jpeg",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleure artiste danseur au rythme folklorique",
  },
  {
    name: "Kibong adoube",
    title: "Adorned Master",
    image: "/dancers/Kibong adoube.jpeg",
    votes: 1445,
    badge: null,
    percentage: 35,
    category: "Meilleure artiste danseur au rythme folklorique",
  },

  // Meilleur artiste danseur afro coupé décalé
  {
    name: "Ordinateur baboué",
    title: "Afro Master",
    image: "/dancers/ORDINATEUR baboué.jpeg",
    votes: 2156,
    badge: 1,
    percentage: 53,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Shazam le vrai",
    title: "Décalé Star",
    image: "/dancers/SHAZAM.jpeg",
    votes: 1923,
    badge: null,
    percentage: 47,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Xender",
    title: "Afro Coupé Artist",
    image: "/dancers/XENDER.jpeg",
    votes: 1756,
    badge: null,
    percentage: 43,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "BB Super l'elu",
    title: "Elite Dancer",
    image: "/dancers/Bb super lélu.jpeg",
    votes: 1634,
    badge: null,
    percentage: 40,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Vinny magicien",
    title: "Magical Performer",
    image: "/dancers/Vinny magicien.jpg",
    votes: 1489,
    badge: null,
    percentage: 36,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Smobar Le Balthazar",
    title: "Smooth Dancer",
    image: "/dancers/Smobar Le Balthazar.jpg",
    votes: 1367,
    badge: null,
    percentage: 33,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Authentik",
    title: "Authentic Performer",
    image: "/dancers/Authentik.jpg",
    votes: 1256,
    badge: null,
    percentage: 31,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Pikan pointure",
    title: "Sharp Dancer",
    image: "/dancers/Pikan pointu.jpeg",
    votes: 1145,
    badge: null,
    percentage: 28,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Wenjel Avataro",
    title: "Avatar Dancer",
    image: "/dancers/Wenjel Avataro.jpeg",
    votes: 1034,
    badge: null,
    percentage: 25,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Jesus saotao",
    title: "Spiritual Dancer",
    image: "/dancers/JEZUS SAOTAO.jpeg",
    votes: 923,
    badge: null,
    percentage: 22,
    category: "Meilleur artiste danseur afro coupé décalé",
  },

  // Meilleur artiste danseur mbolé
  {
    name: "Petit tchakap",
    title: "Mbolé Master",
    image: "/dancers/petit tchakap.jpg",
    votes: 1867,
    badge: 1,
    percentage: 46,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Déboy le monstre",
    title: "Monster Moves",
    image: "/dancers/DEBOY LE MONSTRE.jpeg",
    votes: 1723,
    badge: null,
    percentage: 42,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "El fally du 237",
    title: "Talented Artist",
    image: "/dancers/El fally du 237.jpg",
    votes: 1598,
    badge: null,
    percentage: 39,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Tks officiel",
    title: "Official Performer",
    image: "/dancers/TKS OFFICIEL.jpg",
    votes: 1467,
    badge: null,
    percentage: 36,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "4 peace",
    title: "Four Peace Group",
    image: "/dancers/4 peace.jpeg",
    votes: 1345,
    badge: null,
    percentage: 33,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Echantillon 1er",
    title: "First Sample",
    image: "/dancers/Échantillon 1er.jpeg",
    votes: 1234,
    badge: null,
    percentage: 30,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Yvan 10",
    title: "Perfect Ten",
    image: "/dancers/yvan-10.jpg",
    votes: 1123,
    badge: null,
    percentage: 27,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Nyanga Boy",
    title: "Boy Performer",
    image: "/dancers/Nyanga Boy.jpeg",
    votes: 1012,
    badge: null,
    percentage: 25,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Trésor brown",
    title: "Brown Treasure",
    image: "/dancers/Tresor Brown.jpeg",
    votes: 901,
    badge: null,
    percentage: 22,
    category: "Meilleur artiste danseur mbolé",
  },

  // Meilleure artiste danseuse mbolé
  {
    name: "Nelly Dora",
    title: "Mbolé Master",
    image: "/dancers/NELLY DORA.jpeg",
    votes: 1956,
    badge: 1,
    percentage: 48,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Maguy merine",
    title: "Mbolé Star",
    image: "/dancers/MAGUY MERINE.jpeg",
    votes: 1789,
    badge: null,
    percentage: 44,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Kendi",
    title: "Mbolé Dancer",
    image: "/dancers/KENDI.jpeg",
    votes: 1645,
    badge: null,
    percentage: 40,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Chica bassa",
    title: "Traditional Artist",
    image: "/dancers/CHICA BASSA.jpeg",
    votes: 1523,
    badge: null,
    percentage: 37,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Lmn ponce off",
    title: "Performer",
    image: "/dancers/LMN ponce Off.jpeg",
    votes: 1412,
    badge: null,
    percentage: 34,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Influence femi",
    title: "Influential Artist",
    image: "/dancers/Influence Femi.jpeg",
    votes: 1301,
    badge: null,
    percentage: 32,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Jessi 237",
    title: "Rising Star",
    image: "/dancers/Jessi 237.jpeg",
    votes: 1190,
    badge: null,
    percentage: 29,
    category: "Meilleure artiste danseuse mbolé",
  },

  // Meilleur artiste danseur de l'année
  {
    name: "El Fally du 237",
    title: "Dancer of the Year",
    image: "/dancers/El fally du 237.jpg",
    votes: 3456,
    badge: 1,
    percentage: 84,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "BB Super l'elu",
    title: "Super Chosen One",
    image: "/dancers/Bb super lélu.jpeg",
    votes: 3123,
    badge: 2,
    percentage: 76,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "Déboy le monstre",
    title: "The Monster",
    image: "/dancers/DEBOY LE MONSTRE.jpeg",
    votes: 2867,
    badge: 3,
    percentage: 70,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "Escram shuwingum",
    title: "Smooth Performer",
    image: "/dancers/ESCRAM.jpeg",
    votes: 2645,
    badge: null,
    percentage: 64,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "Shazam le vrai",
    title: "The Real One",
    image: "/dancers/SHAZAM.jpeg",
    votes: 2434,
    badge: null,
    percentage: 59,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "Kibong adoube",
    title: "Adorned Star",
    image: "/dancers/Kibong adoube.jpeg",
    votes: 2256,
    badge: null,
    percentage: 55,
    category: "Meilleur artiste danseur de l'année",
  },

  // Meilleur artiste jeune danseur/danseuse
  {
    name: "Maxime la vitesse",
    title: "Young Prodigy",
    image: "/dancers/Maxime la vitesse.jpg",
    votes: 2234,
    badge: 1,
    percentage: 54,
    category: "Meilleur artiste jeune danseur/danseuse",
  },
  {
    name: "Kloe la machine",
    title: "Young Talent",
    image: "/dancers/Kloe la machine.JPG",
    votes: 2067,
    badge: 2,
    percentage: 50,
    category: "Meilleur artiste jeune danseur/danseuse",
  },
  {
    name: "Maldjess peace",
    title: "Rising Star",
    image: "/dancers/Meldjess peace.jpeg",
    votes: 1889,
    badge: null,
    percentage: 46,
    category: "Meilleur artiste jeune danseur/danseuse",
  },
  {
    name: "Jumeaux de la capitale",
    title: "Talented Duo",
    image: "/dancers/JUMAUX DE LA CAPITALE.jpg",
    votes: 1734,
    badge: null,
    percentage: 42,
    category: "Meilleur artiste jeune danseur/danseuse",
  },

  // Meilleure artiste danseuse de l'année
  {
    name: "Katia eg",
    title: "Female Dancer of Year",
    image: "/dancers/Katia EG.png",
    votes: 3567,
    badge: 1,
    percentage: 87,
    category: "Meilleure artiste danseuse de l'année",
  },
  {
    name: "Kendi",
    title: "Star Performer",
    image: "/dancers/KENDI.jpeg",
    votes: 3234,
    badge: 2,
    percentage: 79,
    category: "Meilleure artiste danseuse de l'année",
  },
  {
    name: "Beb's velina",
    title: "Elegant Dancer",
    image: "/dancers/Beb’s vélina.jpeg",
    votes: 2978,
    badge: 3,
    percentage: 73,
    category: "Meilleure artiste danseuse de l'année",
  },
  {
    name: "Maguy merine",
    title: "Talented Artist",
    image: "/dancers/MAGUY MERINE.jpeg",
    votes: 2756,
    badge: null,
    percentage: 67,
    category: "Meilleure artiste danseuse de l'année",
  },
  {
    name: "O'konor Céleste",
    title: "Celestial Star",
    image: "/dancers/O’konor Celeste.jpeg",
    votes: 2545,
    badge: null,
    percentage: 62,
    category: "Meilleure artiste danseuse de l'année",
  },

]

const mainCategories = [
  "Meilleur artiste danseur - masculin",
  "Meilleure artiste danseuse féminine",
  "Meilleur groupe de danse",
  "Meilleur collaboration duo",
  "Meilleur artiste Chorégraphe",
  "Meilleur Performance web",
  "Meilleure artiste danseur au rythme folklorique",
  "Meilleur artiste danseur afro coupé décalé",
  "Meilleur artiste danseur mbolé",
  "Meilleure artiste danseuse mbolé",
  "Meilleur artiste danseur de l'année",
  "Meilleur artiste jeune danseur/danseuse",
  "Meilleure artiste danseuse de l'année",
]


const honoraryPrizes = [
  "Best inspiration pour la jeunesse",
  "Best soutien pour la jeunesse",
  "Prix d'encouragements (discipline & travail des danseurs)"
]

export default function NBDanceAwardPage() {
  const [showBanner, setShowBanner] = useState(true)
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<(typeof candidates)[0] | null>(null)
  const [voteCount, setVoteCount] = useState(5)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"mobile" | "orange" | "bank">("mobile")
  const [selectedProvider, setSelectedProvider] = useState("mtn-momo-cameroon")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop")

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
    } else if (selectedPaymentMethod === "bank") {
      setSelectedProvider("bank-transfer-cameroon")
    }
  }, [selectedPaymentMethod])

  const handleCandidateClick = (candidate: (typeof candidates)[0]) => {
    setSelectedCandidate(candidate)
    setVoteCount(5)
    setIsVotingModalOpen(true)
  }

  const incrementVotes = () => setVoteCount((prev) => prev + 1)
  const decrementVotes = () => setVoteCount((prev) => Math.max(5, prev - 1))

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

  const getCandidatesByCategory = (category: string) => {
    return candidates.filter((c) => c.category === category)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const getInitialVisibleCount = () => {
    if (screenSize === "mobile") return 2 // 2 columns × 1 row
    if (screenSize === "tablet") return 3 // 3 columns × 1 row
    return 5 // 5 columns × 1 row
  }

  const getVisibleCandidates = (category: string) => {
    const categoryCandidates = getCandidatesByCategory(category)
    const isExpanded = expandedCategories.has(category)
    const initialCount = getInitialVisibleCount()
    return isExpanded ? categoryCandidates : categoryCandidates.slice(0, initialCount)
  }

  const shouldShowButton = (category: string) => {
    const categoryCandidates = getCandidatesByCategory(category)
    const initialCount = getInitialVisibleCount()
    return categoryCandidates.length > initialCount
  }

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
          <div className="flex items-center gap-2 md:gap-3">
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
                    <Image src="/logo.png" alt="NB Dance Award" fill className="object-contain" />
                  </div>
                  <SheetTitle className="text-left">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">NB </span>
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
        <section className="relative overflow-hidden">
          <div className="relative h-[400px] md:h-[500px]">
            <Image src="/banner-dancers.jpg" alt="Dancers performing on stage" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

            <div className="container relative mx-auto flex h-full flex-col justify-end px-4 pb-8 md:px-6 md:pb-12">
              <div className="max-w-2xl">
                <h1 className="mb-4 text-3xl font-bold leading-tight text-balance md:mb-6 md:text-5xl lg:text-6xl">
                  Célébrons les étoiles de la danse au Cameroun
                  <br />
                  1ère édition
                </h1>

                <Link href="/candidats">
                  <Button
                    size="lg"
                    className="mb-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold px-6 py-5 text-sm md:px-8 md:py-6 md:text-base rounded-md uppercase"
                  >
                    VOTEZ MAINTENANT!
                  </Button>
                </Link>

                <p className="text-xs text-zinc-300 md:text-sm">Les votes sont payants</p>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Carousel */}
        <PartnersCarousel
          partners={[
            { name: "LOGOGGG", logo: "/partners/LOGOGGG.png" },
            { name: "WhatsApp Image 1", logo: "/partners/WhatsApp Image 2025-10-07 à 17.22.43_94d52ea3.jpg" },
            { name: "WhatsApp Image 2", logo: "/partners/WhatsApp Image 2025-11-10 à 07.19.11_8ab8bff9.jpg" },
            { name: "WhatsApp Image 3", logo: "/partners/WhatsApp Image 2025-11-13 à 22.31.35_9f132a8b.jpg" },
            { name: "NB", logo: "/partners/nb.png" },
            { name: "Partenaire Officiel", logo: "/partners/partenaire officiel.jpg" },
            { name: "Photo Partner", logo: "/partners/photo_2025-08-18_12-32-07.png" },
          ]}
          autoPlay={true}
          autoPlayInterval={4000}
          showControls={true}
        />

        <div className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-8 md:mb-12 text-3xl md:text-4xl font-bold text-center">Catégories Principales</h2>

            {mainCategories.map((category) => {
              const categoryCandidates = getCandidatesByCategory(category)
              const visibleCandidates = getVisibleCandidates(category)
              const isExpanded = expandedCategories.has(category)
              const showButton = shouldShowButton(category)

              if (categoryCandidates.length === 0) return null

              return (
                <section key={category} id={category.toLowerCase().replace(/\s+/g, "-")} className="mb-12 md:mb-16">
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{category}</h3>
                    <div className="h-1 w-20 bg-yellow-500 rounded-full"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5">
                    {visibleCandidates.map((candidate, index) => (
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

                        <h3 className="mb-1 text-center text-sm md:text-base font-semibold">{candidate.name}</h3>
                        <span className="mb-2 md:mb-3 text-[10px] md:text-xs text-yellow-500 font-medium">
                          {candidate.title}
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

                  {showButton && (
                    <div className="flex justify-center mt-6 md:mt-8">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors text-sm md:text-base font-medium"
                      >
                        {isExpanded ? (
                          <>
                            <span>Voir Moins</span>
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span>Voir Plus ({categoryCandidates.length - getInitialVisibleCount()} autres)</span>
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <section className="border-t border-zinc-800 py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-8 text-center text-2xl font-bold md:mb-12 md:text-3xl">Comment Ça Marche ?</h2>

            <div className="grid gap-8 md:grid-cols-3 md:gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-yellow-500 bg-gradient-to-br from-yellow-600/10 to-yellow-800/10 md:mb-6 md:h-24 md:w-24">
                  <Smartphone className="h-10 w-10 text-yellow-500 md:h-12 md:w-12" />
                </div>
                <div className="mb-2 text-sm font-bold text-yellow-500">GO</div>
                <h3 className="text-sm font-semibold md:text-base">1. Choisissez en Votre Danseur</h3>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-yellow-500 bg-gradient-to-br from-yellow-600/10 to-yellow-800/10 md:mb-6 md:h-24 md:w-24">
                  <CreditCard className="h-10 w-10 text-yellow-500 md:h-12 md:w-12" />
                </div>
                <div className="mb-2 text-sm font-bold text-yellow-500">GG</div>
                <h3 className="text-sm font-semibold md:text-base">2. Payez Vos Votes!</h3>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-yellow-500 bg-gradient-to-br from-yellow-600/10 to-yellow-800/10 md:mb-6 md:h-24 md:w-24">
                  <Award className="h-10 w-10 text-yellow-500 md:h-12 md:w-12" />
                </div>
                <div className="mb-2 text-sm font-bold text-yellow-500">GQ</div>
                <h3 className="text-sm font-semibold md:text-base">3. tnellas Dantre Metas</h3>
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
                <a href="#" className="hover:text-white transition-colors">
                  Support
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

      {/* Login/Register Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-zinc-800 p-0">
          <DialogTitle className="sr-only">
            {authMode === "login" ? "Connexion" : "Inscription"}
          </DialogTitle>
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
                    {authMode === "login" ? "Se Connecter" : "Se Connecter"}
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

      {/* Voting Modal */}
      <Dialog open={isVotingModalOpen} onOpenChange={setIsVotingModalOpen}>
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
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-1 right-1 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-pink-500">
                        <Lock className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold mb-1 text-white">{selectedCandidate.name}</h3>
                    <p className="text-white text-xs md:text-sm">{selectedCandidate.title}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-base md:text-lg font-semibold mb-3 text-white">Nombre de Votes</h3>
                    <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
                      <button
                        onClick={decrementVotes}
                        className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-zinc-700 hover:border-yellow-500 transition-colors text-white"
                      >
                        <Minus className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </button>
                      <div className="text-3xl md:text-4xl font-bold w-16 md:w-20 text-center text-white">{voteCount}</div>
                      <button
                        onClick={incrementVotes}
                        className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-zinc-700 hover:border-yellow-500 transition-colors text-white"
                      >
                        <Plus className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </button>
                    </div>

                    <div className="text-center space-y-0.5">
                      <p className="text-xs md:text-sm font-semibold text-white">1 Vote = 105 XAF.</p>
                      <p className="text-xs md:text-sm text-white">Minimum 5 votes.</p>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 md:py-5 text-sm md:text-base rounded-full uppercase">
                    Proceed to payment
                  </Button>
                </>
              )}
            </div>

            {/* Right Side - Secure Payment */}
            <div className="p-4 md:p-6 bg-zinc-900/50">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Paiement Sécurisé</h2>

              {/* Payment Methods */}
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
                  <span className="text-[10px] md:text-xs text-center font-medium leading-tight text-white">Mobile Money</span>
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
                  <span className="text-[10px] md:text-xs text-center font-medium leading-tight text-white">Orange Money</span>
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
                  <span className="text-[10px] md:text-xs text-center font-medium leading-tight text-white">Virement / Carte</span>
                </button>
              </div>

              {/* Selected Payment Method Display */}
              <div className="mb-4 md:mb-6 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 p-3 text-center text-sm md:text-base font-semibold">
                {selectedPaymentMethod === "mobile"
                  ? "Mobile Money"
                  : selectedPaymentMethod === "orange"
                    ? "Orange Money"
                    : "Virement Bancaire / Carte"}
              </div>

              {/* Provider Selection */}
              <div className="mb-4 md:mb-6">
                <label className="mb-1.5 md:mb-2 block text-xs md:text-sm font-medium text-white">
                  Sélectionnez le Fournisseur
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-white focus:border-yellow-500 focus:outline-none [&_option]:bg-zinc-900 [&_option]:text-white"
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

              {/* Total Votes */}
              <div className="mb-4 md:mb-6">
                <div className="rounded-lg bg-zinc-800 px-3 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-white">
                  Total Votes: {voteCount}
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-6 md:mb-8">
                <label className="mb-1.5 md:mb-2 block text-xs md:text-sm font-medium text-white">Numéro de Téléphone</label>
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
