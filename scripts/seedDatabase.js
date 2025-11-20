/**
 * Firebase Database Seed Script (Node.js)
 * Run this once to populate your Firebase Realtime Database with candidate data
 * 
 * Usage: node scripts/seedDatabase.js
 */

const { initializeApp } = require('firebase/app')
const { getDatabase, ref, set } = require('firebase/database')

const firebaseConfig = {
  apiKey: "AIzaSyDW7wbUtGivk_uosXs_gZ_fKAAozVXEk7c",
  authDomain: "project-5583295336911612869.firebaseapp.com",
  databaseURL: "https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "project-5583295336911612869",
  storageBucket: "project-5583295336911612869.firebasestorage.app",
  messagingSenderId: "816715936754",
  appId: "1:816715936754:web:28d23b835fad9e6b33b16b",
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

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
    title: "Peace Trio",
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
    id: "afu-dance-academie",
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

  // Meilleur collaboration duo
  {
    id: "deboy-maguy",
    name: "Déboy le monstre et Maguy merine",
    title: "Monster & Queen",
    image: "/dancers/DEBOY LE MONSTRE.jpeg",
    votes: 1956,
    badge: 1,
    percentage: 48,
    category: "Meilleur collaboration duo",
  },
  {
    id: "4peace-rachel",
    name: "4 peace et Rachel élégance",
    title: "Peace & Elegance",
    image: "/dancers/4 peace.jpeg",
    votes: 1723,
    badge: null,
    percentage: 42,
    category: "Meilleur collaboration duo",
  },
  {
    id: "chica-kendi",
    name: "Chica bassa et kendi",
    title: "Chica & Kendi",
    image: "/dancers/CHICA BASSA.jpeg",
    votes: 1534,
    badge: null,
    percentage: 37,
    category: "Meilleur collaboration duo",
  },
]

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seed...')
    
    // Add candidates
    for (const candidate of candidatesData) {
      await set(ref(database, `candidates/${candidate.id}`), candidate)
      console.log(`✅ Added: ${candidate.name}`)
    }

    // Initialize votes and users collections
    await set(ref(database, 'votes'), {})
    await set(ref(database, 'users'), {})

    console.log('\n✨ Database seeding completed successfully!')
    console.log(`📊 Total candidates added: ${candidatesData.length}`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
