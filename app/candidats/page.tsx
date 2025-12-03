"use client"

import { Menu, X, ChevronDown, ChevronUp, Plus, Minus, Lock, AlertCircle, CheckCircle, CheckCircle2, Loader2, Share2, Smartphone, Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import ImageWithFallback from "@/components/ImageWithFallback"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CountdownPopup } from "@/components/CountdownPopup"
import { useCandidates } from "@/hooks/useFirebaseData"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { validatePhoneNumber, formatPhoneNumber, detectOperator, getOperatorName, type MobileOperator } from "@/lib/phoneValidation"
import { decodeVoteLinkClient, encodeVoteLinkClient } from "@/lib/voteLinks"
import { useVoting } from "@/hooks/useVoting"

// Keep old data for reference (commented out)
const oldStaticCandidates = [
  // 1- Meilleure artiste danseuse féminine
  {
    name: "Maguy merine",
    title: "Dance Star",
    image: "/dancers/MAGUY MERINE.webp",
    votes: 2534,
    badge: 1,
    percentage: 62,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Kendi",
    title: "Dance Performer",
    image: "/dancers/KENDI.webp",
    votes: 2245,
    badge: 2,
    percentage: 55,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Beb's velina",
    title: "Talented Dancer",
    image: "/dancers/bebs-velina.webp",
    votes: 1956,
    badge: null,
    percentage: 48,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Katia eg",
    title: "Professional Artist",
    image: "/dancers/Katia EG.webp",
    votes: 1723,
    badge: null,
    percentage: 42,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Stella officielle3",
    title: "Star Performer",
    image: "/dancers/Stella Officielle3.webp",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "Nounours",
    title: "Dynamic Dancer",
    image: "/dancers/Nounours.webp",
    votes: 1423,
    badge: null,
    percentage: 35,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    name: "O'konor Céleste",
    title: "Rising Star",
    image: "/dancers/okonor-celeste.webp",
    votes: 1298,
    badge: null,
    percentage: 32,
    category: "Meilleure artiste danseuse féminine",
  },

  // 2- Meilleure artiste danseuse mbolé
  {
    name: "Nelly Dora",
    title: "Mbolé Master",
    image: "/dancers/NELLY DORA.webp",
    votes: 1956,
    badge: 1,
    percentage: 48,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Maguy merine",
    title: "Mbolé Star",
    image: "/dancers/MAGUY MERINE.webp",
    votes: 1789,
    badge: null,
    percentage: 44,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Kendi",
    title: "Mbolé Dancer",
    image: "/dancers/KENDI.webp",
    votes: 1645,
    badge: null,
    percentage: 40,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Chica bassa",
    title: "Traditional Artist",
    image: "/dancers/CHICA BASSA.webp",
    votes: 1523,
    badge: null,
    percentage: 37,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Lmn ponce off",
    title: "Performer",
    image: "/dancers/LMN ponce Off.webp",
    votes: 1412,
    badge: null,
    percentage: 34,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Influence femi",
    title: "Influential Artist",
    image: "/dancers/Influence Femi.webp",
    votes: 1301,
    badge: null,
    percentage: 32,
    category: "Meilleure artiste danseuse mbolé",
  },
  {
    name: "Jessi 237",
    title: "Rising Star",
    image: "/dancers/Jessi 237.webp",
    votes: 1190,
    badge: null,
    percentage: 29,
    category: "Meilleure artiste danseuse mbolé",
  },

  // 3- Meilleur artiste jeune danseur/danseuse
  {
    name: "Maxime la vitesse",
    title: "Young Prodigy",
    image: "/dancers/Maxime la vitesse.webp",
    votes: 2234,
    badge: 1,
    percentage: 54,
    category: "Meilleur artiste jeune danseur/danseuse",
  },
  {
    name: "Kloe la machine",
    title: "Young Talent",
    image: "/dancers/Kloe la machine.webp",
    votes: 2067,
    badge: 2,
    percentage: 50,
    category: "Meilleur artiste jeune danseur/danseuse",
  },
  {
    name: "Maldjess peace",
    title: "Rising Star",
    image: "/dancers/Meldjess peace.webp",
    votes: 1889,
    badge: null,
    percentage: 46,
    category: "Meilleur artiste jeune danseur/danseuse",
  },
  {
    name: "Jumeaux de la capitale",
    title: "Talented Duo",
    image: "/dancers/JUMAUX DE LA CAPITALE.webp",
    votes: 1734,
    badge: null,
    percentage: 42,
    category: "Meilleur artiste jeune danseur/danseuse",
  },

  // 4- Meilleur Performance web
  {
    name: "Kendi",
    title: "Web Star",
    image: "/dancers/KENDI.webp",
    votes: 3245,
    badge: 1,
    percentage: 79,
    category: "Meilleur Performance web",
  },
  {
    name: "Déboy le monstre",
    title: "Viral Sensation",
    image: "/dancers/DEBOY LE MONSTRE.webp",
    votes: 2834,
    badge: 2,
    percentage: 69,
    category: "Meilleur Performance web",
  },
  {
    name: "El fally 237",
    title: "Online Star",
    image: "/dancers/El fally du 237.webp",
    votes: 2456,
    badge: null,
    percentage: 60,
    category: "Meilleur Performance web",
  },
  {
    name: "Jkaxel",
    title: "Internet Performer",
    image: "/dancers/JKAXEL.webp",
    votes: 2189,
    badge: null,
    percentage: 53,
    category: "Meilleur Performance web",
  },
  {
    name: "Maguy merine",
    title: "Online Presence",
    image: "/dancers/MAGUY MERINE.webp",
    votes: 1967,
    badge: null,
    percentage: 48,
    category: "Meilleur Performance web",
  },
  {
    name: "Jessi 237",
    title: "Digital Star",
    image: "/dancers/Jessi 237.webp",
    votes: 1789,
    badge: null,
    percentage: 44,
    category: "Meilleur Performance web",
  },
  {
    name: "Étienne kampos",
    title: "Web Performer",
    image: "/dancers/Etienne kampos.webp",
    votes: 1623,
    badge: null,
    percentage: 40,
    category: "Meilleur Performance web",
  },
  {
    name: "Nelly Dora",
    title: "Online Artist",
    image: "/dancers/NELLY DORA.webp",
    votes: 1467,
    badge: null,
    percentage: 36,
    category: "Meilleur Performance web",
  },
  {
    name: "Chica bassa",
    title: "Viral Artist",
    image: "/dancers/CHICA BASSA.webp",
    votes: 1323,
    badge: null,
    percentage: 32,
    category: "Meilleur Performance web",
  },
  {
    name: "Nounours",
    title: "Popular Online",
    image: "/dancers/Nounours.webp",
    votes: 1189,
    badge: null,
    percentage: 29,
    category: "Meilleur Performance web",
  },

  // 5- Meilleur Groupe de danse
  {
    name: "AFU Dance académie",
    title: "Professional Group",
    image: "/dancers/AFU DANCE ACADEMY STUDIO.webp",
    votes: 2089,
    badge: 1,
    percentage: 51,
    category: "Meilleur groupe de danse",
  },
  {
    name: "Etat NWAR dance",
    title: "Dance Collective",
    image: "/dancers/ÉTAT NWAR DANCE SCHOOL.webp",
    votes: 1834,
    badge: null,
    percentage: 45,
    category: "Meilleur groupe de danse",
  },
  {
    name: "Team Escram",
    title: "Dance Crew",
    image: "/dancers/TEAM ESCRAM.webp",
    votes: 1689,
    badge: null,
    percentage: 41,
    category: "Meilleur groupe de danse",
  },
  {
    name: "Mbolé Dancing",
    title: "Cultural Group",
    image: "/dancers/Mbole Dancing.webp",
    votes: 1445,
    badge: null,
    percentage: 35,
    category: "Meilleur groupe de danse",
  },

  // 6- Meilleur artiste danseur Afro Coupé décalé
  {
    name: "Ordinateur baboué",
    title: "Afro Master",
    image: "/dancers/ORDINATEUR baboué.webp",
    votes: 2156,
    badge: 1,
    percentage: 53,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Shazam le vrai",
    title: "Décalé Star",
    image: "/dancers/SHAZAM.webp",
    votes: 1923,
    badge: null,
    percentage: 47,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Xender",
    title: "Afro Coupé Artist",
    image: "/dancers/XENDER.webp",
    votes: 1756,
    badge: null,
    percentage: 43,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "BB Super l'elu",
    title: "Elite Dancer",
    image: "/dancers/Bb super lélu.webp",
    votes: 1634,
    badge: null,
    percentage: 40,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Vinny magicien",
    title: "Magical Performer",
    image: "/dancers/Vinny magicien.webp",
    votes: 1489,
    badge: null,
    percentage: 36,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Smobar Le Balthazar",
    title: "Smooth Dancer",
    image: "/dancers/Smobar Le Balthazar.webp",
    votes: 1367,
    badge: null,
    percentage: 33,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Authentik",
    title: "Authentic Performer",
    image: "/dancers/Authentik.webp",
    votes: 1256,
    badge: null,
    percentage: 31,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Pikan pointure",
    title: "Sharp Dancer",
    image: "/dancers/Pikan pointu.webp",
    votes: 1145,
    badge: null,
    percentage: 28,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Wenjel Avataro",
    title: "Avatar Dancer",
    image: "/dancers/Wenjel Avataro.webp",
    votes: 1034,
    badge: null,
    percentage: 25,
    category: "Meilleur artiste danseur afro coupé décalé",
  },
  {
    name: "Jesus saotao",
    title: "Spiritual Dancer",
    image: "/dancers/JEZUS SAOTAO.webp",
    votes: 923,
    badge: null,
    percentage: 22,
    category: "Meilleur artiste danseur afro coupé décalé",
  },

  // 7- Meilleur artiste Danseurs masculin
  {
    name: "Étienne kampos",
    title: "Male Dance King",
    image: "/dancers/Etienne kampos.webp",
    votes: 1847,
    badge: 1,
    percentage: 45,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "De Flow",
    title: "Flow Master",
    image: "/dancers/De Flow.webp",
    votes: 1654,
    badge: null,
    percentage: 40,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "Pascal métaphore",
    title: "Poetic Dancer",
    image: "/dancers/PASCAL métaphore.webp",
    votes: 1432,
    badge: null,
    percentage: 35,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "El Fally du 237",
    title: "Cameroon Star",
    image: "/dancers/El fally du 237.webp",
    votes: 1289,
    badge: null,
    percentage: 31,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "Escram shuwingum",
    title: "Smooth Performer",
    image: "/dancers/ESCRAM.webp",
    votes: 1156,
    badge: null,
    percentage: 28,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "Petit tchakap",
    title: "Small but Mighty",
    image: "/dancers/petit tchakap.webp",
    votes: 1089,
    badge: null,
    percentage: 26,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "3 peace",
    title: "Trio Performer",
    image: "/dancers/3 peace.webp",
    votes: 987,
    badge: null,
    percentage: 24,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    name: "Jkaxel",
    title: "Urban Legend",
    image: "/dancers/JKAXEL.webp",
    votes: 876,
    badge: null,
    percentage: 21,
    category: "Meilleur artiste danseur - masculin",
  },

  // 8- meilleurs artiste danseurs mbolé
  {
    name: "Petit tchakap",
    title: "Mbolé Master",
    image: "/dancers/petit tchakap.webp",
    votes: 1867,
    badge: 1,
    percentage: 46,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Déboy le monstre",
    title: "Monster Moves",
    image: "/dancers/DEBOY LE MONSTRE.webp",
    votes: 1723,
    badge: null,
    percentage: 42,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "El fally du 237",
    title: "Talented Artist",
    image: "/dancers/El fally du 237.webp",
    votes: 1598,
    badge: null,
    percentage: 39,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Tks officiel",
    title: "Official Performer",
    image: "/dancers/TKS OFFICIEL.webp",
    votes: 1467,
    badge: null,
    percentage: 36,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "4 peace",
    title: "Four Peace Group",
    image: "/dancers/4 peace.webp",
    votes: 1345,
    badge: null,
    percentage: 33,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Echantillon 1er",
    title: "First Sample",
    image: "/dancers/Échantillon 1er.webp",
    votes: 1234,
    badge: null,
    percentage: 30,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Yvan 10",
    title: "Perfect Ten",
    image: "/dancers/yvan-10.webp",
    votes: 1123,
    badge: null,
    percentage: 27,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Nyanga Boy",
    title: "Boy Performer",
    image: "/dancers/Nyanga Boy.webp",
    votes: 1012,
    badge: null,
    percentage: 25,
    category: "Meilleur artiste danseur mbolé",
  },
  {
    name: "Trésor brown",
    title: "Brown Treasure",
    image: "/dancers/Tresor Brown.webp",
    votes: 901,
    badge: null,
    percentage: 22,
    category: "Meilleur artiste danseur mbolé",
  },

  // 9- meilleur artiste danseur au rythme folklorique
  {
    name: "Ayi ventilateur",
    title: "Wind Master",
    image: "/dancers/ayi ventilateur.webp",
    votes: 1834,
    badge: 1,
    percentage: 45,
    category: "Meilleur artiste danseur au rythme folklorique",
  },
  {
    name: "Nounours traditionnel",
    title: "Traditional Bear",
    image: "/dancers/le nounours traditionnel.webp",
    votes: 1689,
    badge: null,
    percentage: 41,
    category: "Meilleur artiste danseur au rythme folklorique",
  },
  {
    name: "Arcadien fureur",
    title: "Arcadian Fury",
    image: "/dancers/Accadient Fureur.webp",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleur artiste danseur au rythme folklorique",
  },
  {
    name: "Kibong adoube",
    title: "Adorned Master",
    image: "/dancers/Kibong adoube.webp",
    votes: 1445,
    badge: null,
    percentage: 35,
    category: "Meilleur artiste danseur au rythme folklorique",
  },

  // 10-meilleurs danseur de l'année
  {
    name: "El Fally du 237",
    title: "Dancer of the Year",
    image: "/dancers/El fally du 237.webp",
    votes: 3456,
    badge: 1,
    percentage: 84,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "BB Super l'elu",
    title: "Super Chosen One",
    image: "/dancers/Bb super lélu.webp",
    votes: 3123,
    badge: 2,
    percentage: 76,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "Déboy le monstre",
    title: "The Monster",
    image: "/dancers/DEBOY LE MONSTRE.webp",
    votes: 2867,
    badge: 3,
    percentage: 70,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "Escram shuwingum",
    title: "Smooth Performer",
    image: "/dancers/ESCRAM.webp",
    votes: 2645,
    badge: null,
    percentage: 64,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "Shazam le vrai",
    title: "The Real One",
    image: "/dancers/SHAZAM.webp",
    votes: 2434,
    badge: null,
    percentage: 59,
    category: "Meilleur artiste danseur de l'année",
  },
  {
    name: "Kibong adoube",
    title: "Adorned Star",
    image: "/dancers/Kibong adoube.webp",
    votes: 2256,
    badge: null,
    percentage: 55,
    category: "Meilleur artiste danseur de l'année",
  },

  // 11-Meilleurs artiste chorégraphes
  {
    name: "Accadien fureur",
    title: "Arcadian Choreographer",
    image: "/dancers/Accadient Fureur.webp",
    votes: 2245,
    badge: 1,
    percentage: 55,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "Goldy lastar",
    title: "Golden Star",
    image: "/dancers/GOLDY LA-STAR.webp",
    votes: 2089,
    badge: null,
    percentage: 51,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "Garçon déterminé",
    title: "Determined Boy",
    image: "/dancers/Garçon déterminé.webp",
    votes: 1834,
    badge: null,
    percentage: 45,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "El Fally du 237",
    title: "Versatile Artist",
    image: "/dancers/El fally du 237.webp",
    votes: 1689,
    badge: null,
    percentage: 41,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "La religion noire",
    title: "Black Religion",
    image: "/dancers/religion  noir.webp",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "Katia eg",
    title: "Female Choreographer",
    image: "/dancers/Katia EG.webp",
    votes: 1445,
    badge: null,
    percentage: 35,
    category: "Meilleur artiste Chorégraphe",
  },
  {
    name: "Le Hempe",
    title: "Hemp Master",
    image: "/dancers/le hempe.webp",
    votes: 1323,
    badge: null,
    percentage: 32,
    category: "Meilleur artiste Chorégraphe",
  },

  // 12- meilleure artiste danseuse de l'année
  {
    name: "Katia eg",
    title: "Female Dancer of Year",
    image: "/dancers/Katia EG.webp",
    votes: 3567,
    badge: 1,
    percentage: 87,
    category: "Meilleure artiste danseuse de l'année",
  },
  {
    name: "Kendi",
    title: "Star Performer",
    image: "/dancers/KENDI.webp",
    votes: 3234,
    badge: 2,
    percentage: 79,
    category: "Meilleure artiste danseuse de l'année",
  },
  {
    name: "Beb's velina",
    title: "Elegant Dancer",
    image: "/dancers/bebs-velina.webp",
    votes: 2978,
    badge: 3,
    percentage: 73,
    category: "Meilleure artiste danseuse de l'année",
  },
  {
    name: "Maguy merine",
    title: "Talented Artist",
    image: "/dancers/MAGUY MERINE.webp",
    votes: 2756,
    badge: null,
    percentage: 67,
    category: "Meilleure artiste danseuse de l'année",
  },
  {
    name: "O'konor Céleste",
    title: "Celestial Star",
    image: "/dancers/okonor-celeste.webp",
    votes: 2545,
    badge: null,
    percentage: 62,
    category: "Meilleure artiste danseuse de l'année",
  },

  // 13- Meilleur collaboration duo
  {
    name: "Déboy le monstre et Maguy merine",
    title: "Monster & Queen",
    image: "/dancers/DEBOY LE MONSTRE.webp",
    votes: 1956,
    badge: 1,
    percentage: 48,
    category: "Meilleur collaboration duo",
  },
  {
    name: "4 peace et Rachel élégance",
    title: "Peace & Elegance",
    image: "/dancers/4 peace.webp",
    votes: 1723,
    badge: null,
    percentage: 42,
    category: "Meilleur collaboration duo",
  },
  {
    name: "Chica bassa et kendi",
    title: "Chica & Kendi",
    image: "/dancers/CHICA BASSA.webp",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleur collaboration duo",
  },
  {
    name: "Tks officiel et Trésor brown",
    title: "TKS & Treasure",
    image: "/dancers/TKS OFFICIEL.webp",
    votes: 1432,
    badge: null,
    percentage: 35,
    category: "Meilleur collaboration duo",
  },
  {
    name: "El fally du 237 et davia off",
    title: "Fally & Davia",
    image: "/dancers/El fally du 237.webp",
    votes: 1298,
    badge: null,
    percentage: 32,
    category: "Meilleur collaboration duo",
  },
  {
    name: "O'konor Celeste et Katia_eg",
    title: "Celeste & Katia",
    image: "/dancers/O’konor Celeste.webp",
    votes: 1178,
    badge: null,
    percentage: 29,
    category: "Meilleur collaboration duo",
  },
  {
    name: "3 peace et Influence femi",
    title: "3Peace & Influence",
    image: "/dancers/3 peace.webp",
    votes: 1056,
    badge: null,
    percentage: 26,
    category: "Meilleur collaboration duo",
  },
  {
    name: "Jumeaux de la capitale",
    title: "Twin Stars",
    image: "/dancers/JUMAUX DE LA CAPITALE.webp",
    votes: 945,
    badge: null,
    percentage: 23,
    category: "Meilleur collaboration duo",
  },
]

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
  const [phoneError, setPhoneError] = useState("")
  const [detectedOperator, setDetectedOperator] = useState<MobileOperator>('unknown')

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
          setPhoneError("")
          setDetectedOperator('unknown')
          setIsVotingModalOpen(true)
        }
      }
    }
  }, [searchParams, allCandidates, selectedCandidate])

  const handleCandidateClick = (candidate: (typeof allCandidates)[0]) => {
    setSelectedCandidate(candidate)
    setVoteCount(1)
    setPhoneNumber("")
    setPhoneError("")
    setDetectedOperator('unknown')
    setIsVotingModalOpen(true)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatPhoneNumber(value)
    setPhoneNumber(formatted)

    // Detect operator in real-time
    const operator = detectOperator(value)
    setDetectedOperator(operator)

    // Validate against selected payment method
    const validation = validatePhoneNumber(value, selectedPaymentMethod)
    setPhoneError(validation.warning || validation.suggestion || '')
  }

  const incrementVotes = () => setVoteCount((prev) => prev + 1)
  const decrementVotes = () => setVoteCount((prev) => Math.max(1, prev - 1))

  // Filter candidates - use full list for specific categories, deduplicated for "All"
  const filteredCandidates = (() => {
    // When a specific category is selected, use ALL candidates (no deduplication)
    const candidatesToFilter = selectedCategory === "Toutes les catégories"
      ? shuffledCandidates  // Deduplicated list for "All Categories"
      : allCandidates       // Full list with duplicates for specific categories

    return candidatesToFilter.filter((candidate) => {
      const matchesSearch = (candidate?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "Toutes les catégories" || (candidate?.category || '') === selectedCategory
      return matchesSearch && matchesCategory
    })
  })()

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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6 animate-stagger">
              {filteredCandidates.map((candidate, index) => (
                <button
                  key={index}
                  onClick={() => handleCandidateClick(candidate)}
                  className="flex flex-col items-center cursor-pointer hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative mb-3 md:mb-4">
                    <div className="relative h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-full border-[3px] md:border-4 border-yellow-500 md:ring-4 md:ring-yellow-500/20 hover-glow transition-smooth">
                      <ImageWithFallback
                        src={candidate.image || "/placeholder.svg"}
                        alt={candidate.name}
                        fill
                        objectFit="cover"
                        objectPosition={`${customImagePositioning[candidate.name] || "top"} center`}
                        placeholder="blur"
                      />
                    </div>
                    {candidate.badge && (
                      <div className="absolute -top-1 -right-1 md:-bottom-1 md:-right-1 md:top-auto flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-pink-500 text-xs font-bold animate-pop-in">
                        {candidate.badge}
                      </div>
                    )}
                  </div>

                  <h3 className="mb-1 md:mb-2 text-center text-sm md:text-base font-semibold">{candidate.name}</h3>

                  <span className="mb-2 px-2 py-0.5 text-[10px] md:text-xs bg-yellow-500/20 text-yellow-500 rounded-full transition-smooth hover:bg-yellow-500/30">
                    {candidate.category}
                  </span>

                  <div className="w-full max-w-[100px] md:max-w-none">
                    <div className="mb-1.5 md:mb-2 h-1 md:h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${candidate.percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] md:text-xs text-zinc-400">
                      <span className="font-semibold text-white">{(candidate?.votes || 0).toLocaleString()}</span>
                      <span>{candidate?.percentage || 0}%</span>
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



      <Dialog open={isVotingModalOpen} onOpenChange={setIsVotingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-zinc-800 p-0">
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
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="6xx xxx xxx"
                      className={`w-full rounded-lg border ${phoneError
                        ? 'border-red-500 focus:border-red-500'
                        : detectedOperator !== 'unknown' && !phoneError
                          ? 'border-green-500 focus:border-green-500'
                          : 'border-zinc-700 focus:border-yellow-500'
                        } bg-zinc-800 pl-20 md:pl-24 pr-10 md:pr-12 py-4 md:py-5 text-sm md:text-base text-white placeholder:text-zinc-500`}
                    />
                    {detectedOperator !== 'unknown' && !phoneError ? (
                      <CheckCircle2 className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    ) : phoneError ? (
                      <AlertCircle className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-red-500" />
                    ) : (
                      <Lock className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-zinc-500" />
                    )}
                  </div>

                  {/* Operator Badge */}
                  {detectedOperator !== 'unknown' && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-medium ${detectedOperator === 'mtn' ? 'text-yellow-500' :
                        detectedOperator === 'orange' ? 'text-orange-500' :
                          'text-green-500'
                        }`}>
                        {getOperatorName(detectedOperator)} détecté
                      </span>
                    </div>
                  )}

                  {/* Error/Warning Message */}
                  {phoneError && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-red-400">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{phoneError}</span>
                    </div>
                  )}
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
                    This may take up to 60 seconds. Do not close this window.
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
