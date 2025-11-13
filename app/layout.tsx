import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "NB Dance Award - Élection de la Supertar",
  description: "NB Dance Award 2024 - Votez pour votre danseur préféré",
  generator: "v0.app",
}
export const metadata = {
  title: 'NB Dance Award - Célébrons la Danse Africaine',
  description: 'Plateforme de vote moderne pour célébrer les talents de danse en Afrique. Votez pour le meilleur danseur, danseuse, groupe de danse et plus.',
  keywords: 'danse africaine, vote danse, coupé décalé, mbolé, danseur africain, concours danse',
  openGraph: {
    title: 'NB Dance Award',
    description: 'Célébrons les talents de danse en Afrique',
    url: 'https://nb-dance-award.vercel.app',
    siteName: 'NB Dance Award',
    locale: 'fr_FR',
    type: 'website',
  },
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
