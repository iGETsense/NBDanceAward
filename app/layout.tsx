import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "../styles/globals.css"


export const metadata: Metadata = {
  title: "NB Dance Award - Élection de la Superstar",
  description: "NB Dance Award Premiere Edition - Votez pour votre danseur préféré parmi les meilleurs talents de danse africaine. Coupé Décalé, Mbolé et plus encore.",
      verification: {
       google: "T9gNRa6AunqtE10YM_eXms2E8edTX7KAe-jAoRORYbc",  // ← Paste the content value here
     },
  keywords: "NB Dance Awards,nb dance awards, danse africaine, vote danse, coupé décalé, mbolé, danseur camerounais, concours danse afrique, superstar danse",
  authors: [{ name: "GET" }],
  creator: "GET",
  publisher: "NB Dance Awards",
  
  // Open Graph (for Facebook, WhatsApp, etc.)
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://nb-dance-award.vercel.app",
    title: "NB Dance Awards - Élection de la Superstar",
    description: "Votez pour votre danseur préféré - NB Dance Awards ",
    siteName: "NB Dance Awards",
    images: [
      {
        url: "/logo.png", // Make sure this exists in your public folder
        width: 1200,
        height: 630,
        alt: "NB Dance Awards Logo",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "NB Dance Award - Élection de la Superstar",
    description: "Votez pour votre danseur préféré - NB Dance Award 2024",
    images: ["/logo.png"],
  },
    generator: 'v0.app'
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
