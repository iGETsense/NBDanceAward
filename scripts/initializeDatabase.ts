/**
 * Database Initialization Script
 * This script helps initialize and manage the database for candidates
 * 
 * Usage:
 *   npx ts-node scripts/initializeDatabase.ts --help
 *   npx ts-node scripts/initializeDatabase.ts --seed
 *   npx ts-node scripts/initializeDatabase.ts --clear
 *   npx ts-node scripts/initializeDatabase.ts --check
 */

import * as fs from 'fs'
import * as path from 'path'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000'

// Load candidates from JSON file
function loadCandidatesFromFile(): any[] {
  try {
    const filePath = path.join(__dirname, '../EXAMPLE_CANDIDATES.json')
    const data = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.candidates || []
  } catch (error) {
    console.error('❌ Failed to load candidates from file:', error)
    return []
  }
}

// Check database status
async function checkDatabase(): Promise<void> {
  console.log('\n📊 Checking database status...\n')

  try {
    const response = await fetch(`${API_BASE_URL}/api/candidates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.success && Array.isArray(data.candidates)) {
      const count = data.candidates.length
      console.log(`✅ Database Status: Connected`)
      console.log(`📈 Total Candidates: ${count}`)

      // Group by category
      const categories = new Map<string, number>()
      data.candidates.forEach((c: any) => {
        const cat = c.category || 'Unknown'
        categories.set(cat, (categories.get(cat) || 0) + 1)
      })

      console.log(`\n📂 Candidates by Category:`)
      Array.from(categories.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
          console.log(`   - ${cat}: ${count}`)
        })

      // Calculate total votes
      const totalVotes = data.candidates.reduce((sum: number, c: any) => sum + (c.votes || 0), 0)
      console.log(`\n🗳️  Total Votes: ${totalVotes.toLocaleString()}`)

      // Find top candidates
      const top5 = data.candidates
        .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
        .slice(0, 5)

      console.log(`\n🏆 Top 5 Candidates:`)
      top5.forEach((c: any, i: number) => {
        console.log(`   ${i + 1}. ${c.name} - ${c.votes} votes`)
      })
    } else {
      console.log(`⚠️  Unexpected response format`)
    }
  } catch (error) {
    console.error(`❌ Database Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.error(`   Make sure the backend is running at ${API_BASE_URL}`)
  }
}

// Seed database
async function seedDatabase(): Promise<void> {
  console.log('\n🌱 Starting database seeding...\n')

  const candidates = loadCandidatesFromFile()

  if (candidates.length === 0) {
    console.error('❌ No candidates found in EXAMPLE_CANDIDATES.json')
    process.exit(1)
  }

  console.log(`📊 Loaded ${candidates.length} candidates from file\n`)

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (const candidate of candidates) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      console.log(`✅ ${candidate.name}`)
      successCount++
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.log(`❌ ${candidate.name} - ${errorMsg}`)
      errors.push(`${candidate.name}: ${errorMsg}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📈 Seeding Summary:')
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log('='.repeat(60))

  if (errors.length > 0 && errors.length <= 10) {
    console.log('\n⚠️  Errors:')
    errors.forEach(err => console.log(`   - ${err}`))
  }

  if (successCount === candidates.length) {
    console.log('\n🎉 All candidates seeded successfully!')
    process.exit(0)
  } else if (successCount > 0) {
    console.log(`\n⚠️  ${successCount} candidates seeded, ${errorCount} failed`)
    process.exit(1)
  } else {
    console.log('\n❌ No candidates were seeded')
    process.exit(1)
  }
}

// Clear database
async function clearDatabase(): Promise<void> {
  console.log('\n⚠️  WARNING: This will delete ALL candidates from the database!\n')

  // In a real application, you would implement this endpoint
  console.log('❌ Clear functionality not yet implemented')
  console.log('   Please manually delete candidates from your database')
  console.log('   Or implement DELETE /api/candidates endpoint')

  process.exit(1)
}

// Show help
function showHelp(): void {
  console.log(`
Database Initialization Script

Usage:
  npx ts-node scripts/initializeDatabase.ts [command]

Commands:
  --seed      Seed database with example candidates
  --check     Check database status and statistics
  --clear     Clear all candidates from database (not implemented)
  --help      Show this help message

Examples:
  npx ts-node scripts/initializeDatabase.ts --seed
  npx ts-node scripts/initializeDatabase.ts --check

Environment Variables:
  API_URL     Backend API URL (default: http://localhost:3000)

Requirements:
  - Backend server must be running
  - Database must be accessible
  - /api/candidates endpoint must be available
  `)
}

// Main
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === '--help') {
    showHelp()
    process.exit(0)
  }

  switch (command) {
    case '--seed':
      await seedDatabase()
      break
    case '--check':
      await checkDatabase()
      process.exit(0)
      break
    case '--clear':
      await clearDatabase()
      break
    default:
      console.error(`❌ Unknown command: ${command}`)
      console.error('   Use --help for available commands')
      process.exit(1)
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
