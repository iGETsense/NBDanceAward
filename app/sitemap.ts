export default function sitemap() {
  return [
    {
      url: 'https://nb-dance-award.vercel.app',  // ✅ Added closing quote
      lastModified: new Date(),
    },
    {
      url: 'https://nb-dance-award.vercel.app/candidats',
      lastModified: new Date(),
    },
    {
      url: 'https://nb-dance-award.vercel.app/classement',
      lastModified: new Date(),
    },
    {
      url: 'https://nb-dance-award.vercel.app/regles',
      lastModified: new Date(),
    },
  ]
}
