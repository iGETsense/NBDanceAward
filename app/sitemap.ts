import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nb-dance-award.vercel.app'
  
  // Date actuelle pour lastModified
  const currentDate = new Date()

  return [
    // Page d'accueil - La plus importante
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    
    // Page des candidats - Très importante (profils des danseurs)
    {
      url: `${baseUrl}/candidats`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    
    // Page de classement - Change fréquemment avec les votes
    {
      url: `${baseUrl}/classement`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    
    // Page des règles - Change rarement
    {
      url: `${baseUrl}/regles`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
