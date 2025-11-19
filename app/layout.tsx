import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "../styles/globals.css"


export const metadata: Metadata = {
  title: "NB Dance Awards - Élection de la Superstar | Votez pour votre Danseur Préféré",
  description: "NB Dance Awards Première Édition - Votez pour votre danseur préféré parmi les meilleurs talents de danse africaine. Coupé Décalé, Mbolé, et plus encore. Concours de danse en ligne avec classement en temps réel.",
  keywords: "NB Dance Awards, danse africaine, vote danse, coupé décalé, mbolé, danseur camerounais, concours danse afrique, superstar danse, élection danseur, vote en ligne, classement danse",
  authors: [{ name: "NB Company" }],
  creator: "NB Company",
  publisher: "NB Dance Awards",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  
  // Verification
  verification: {
    google: "T9gNRa6AunqtE10YM_eXms2E8edTX7KAe-jAoRORYbc",
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        url: '/logo.png',
        type: 'image/png',
      },
    ],
  },

  // Open Graph (for Facebook, WhatsApp, etc.)
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://nb-dance-award.vercel.app",
    title: "NB Dance Awards - Élection de la Superstar",
    description: "Votez pour votre danseur préféré parmi les meilleurs talents de danse africaine. Classement en temps réel avec 67 candidats.",
    siteName: "NB Dance Awards",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "NB Dance Awards Logo",
        type: "image/png",
      },
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "NB Dance Awards",
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "NB Dance Awards - Élection de la Superstar",
    description: "Votez pour votre danseur préféré - Classement en temps réel",
    images: ["/logo.png"],
    creator: "@NBDanceAwards",
  },

  // Additional metadata
  category: "Entertainment",
  classification: "Entertainment",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Alternate links
  alternates: {
    canonical: "https://nb-dance-award.vercel.app",
    languages: {
      "fr-FR": "https://nb-dance-award.vercel.app",
      "en-US": "https://nb-dance-award.vercel.app",
    },
  },

  generator: 'Next.js'
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-title" content="NB Dance Awards" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
