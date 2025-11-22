/**
 * Seed Database via API Script
 * This script populates the database with all candidates using the API endpoint
 * 
 * Usage: npx ts-node scripts/seedViaAPI.ts
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000'

const candidatesData = [
  // Meilleur artiste danseur - masculin
  {
    id: "etienne-kampos",
    name: "Étienne kampos",
    title: "Male Dance King",
    image: "/dancers/Etienne kampos.jpg",
    votes: 1847,
    badge: 1,
    percentage: 45,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    id: "de-flow",
    name: "De Flow",
    title: "Flow Master",
    image: "/dancers/De Flow.jpeg",
    votes: 1654,
    badge: null,
    percentage: 40,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    id: "pascal-metaphore",
    name: "Pascal métaphore",
    title: "Poetic Dancer",
    image: "/dancers/PASCAL métaphore.jpeg",
    votes: 1432,
    badge: null,
    percentage: 35,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    id: "el-fally-du-237",
    name: "El Fally du 237",
    title: "Cameroon Star",
    image: "/dancers/El fally du 237.jpg",
    votes: 1289,
    badge: null,
    percentage: 31,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    id: "escram-shuwingum",
    name: "Escram shuwingum",
    title: "Smooth Performer",
    image: "/dancers/ESCRAM.jpeg",
    votes: 1156,
    badge: null,
    percentage: 28,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    id: "petit-tchakap",
    name: "Petit tchakap",
    title: "Small but Mighty",
    image: "/dancers/petit tchakap.jpg",
    votes: 1089,
    badge: null,
    percentage: 26,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    id: "3-peace",
    name: "3 peace",
    title: "Trio Performer",
    image: "/dancers/3 peace.jpeg",
    votes: 987,
    badge: null,
    percentage: 24,
    category: "Meilleur artiste danseur - masculin",
  },
  {
    id: "jkaxel",
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
    id: "maguy-merine",
    name: "Maguy merine",
    title: "Dance Star",
    image: "/dancers/MAGUY MERINE.jpeg",
    votes: 2534,
    badge: 1,
    percentage: 62,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    id: "kendi",
    name: "Kendi",
    title: "Dance Performer",
    image: "/dancers/KENDI.jpeg",
    votes: 2245,
    badge: 2,
    percentage: 55,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    id: "bebs-velina",
    name: "Beb's velina",
    title: "Talented Dancer",
    image: "/dancers/bebs-velina.jpeg",
    votes: 1956,
    badge: null,
    percentage: 48,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    id: "katia-eg",
    name: "Katia eg",
    title: "Professional Artist",
    image: "/dancers/Katia EG.png",
    votes: 1723,
    badge: null,
    percentage: 42,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    id: "stella-officielle3",
    name: "Stella officielle3",
    title: "Star Performer",
    image: "/dancers/Stella Officielle3.jpeg",
    votes: 1567,
    badge: null,
    percentage: 38,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    id: "nounours",
    name: "Nounours",
    title: "Dynamic Dancer",
    image: "/dancers/Nounours.jpeg",
    votes: 1423,
    badge: null,
    percentage: 35,
    category: "Meilleure artiste danseuse féminine",
  },
  {
    id: "okonor-celeste",
    name: "O'konor Céleste",
    title: "Rising Star",
    image: "/dancers/O'konor Celeste.jpeg",
    votes: 1298,
    badge: null,
    percentage: 32,
    category: "Meilleure artiste danseuse féminine",
  },

  // Meilleur groupe de danse
  {
    id: "afu-dance-academy",
    name: "AFU Dance académie",
    title: "Professional Group",
    image: "/dancers/AFU DANCE ACADEMY STUDIO.jpeg",
    votes: 2089,
    badge: 1,
    percentage: 51,
    category: "Meilleur groupe de danse",
  },
  {
    id: "etat-nwar-dance",
    name: "Etat NWAR dance",
    title: "Dance Collective",
    image: "/dancers/ÉTAT NWAR DANCE SCHOOL.jpg",
    votes: 1834,
    badge: null,
    percentage: 45,
    category: "Meilleur groupe de danse",
  },
  {
    id: "team-escram",
    name: "Team Escram",
    title: "Dance Crew",
    image: "/dancers/TEAM ESCRAM.jpeg",
    votes: 1689,
    badge: null,
    percentage: 41,
    category: "Meilleur groupe de danse",
  },
  {
    id: "mbole-dancing",
    name: "Mbolé Dancing",
    title: "Cultural Group",
    image: "/dancers/Mbole Dancing.jpeg",
    votes: 1445,
    badge: null,
    percentage: 35,
    category: "Meilleur groupe de danse",
  },
]

async function seedDatabase() {
  console.log('🌱 Starting database seeding via API...')
  console.log(`📍 API URL: ${API_BASE_URL}`)
  console.log(`📊 Total candidates to add: ${candidatesData.length}\n`)

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (const candidate of candidatesData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Added: ${candidate.name}`)
      successCount++
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.log(`❌ Failed: ${candidate.name} - ${errorMsg}`)
      errors.push(`${candidate.name}: ${errorMsg}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📈 Seeding Summary:')
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log('='.repeat(50))

  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:')
    errors.forEach(err => console.log(`  - ${err}`))
  }

  if (successCount === candidatesData.length) {
    console.log('\n🎉 All candidates seeded successfully!')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some candidates failed to seed. Please check the errors above.')
    process.exit(1)
  }
}

seedDatabase().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
