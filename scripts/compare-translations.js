/**
 * Compare translation files for missing or extra keys
 *
 * Usage: node scripts/compare-translations.js [--json]
 *
 * This script compares en.ts and de.ts translation files to find:
 * - Keys present in en.ts but missing in de.ts
 * - Keys present in de.ts but missing in en.ts
 */

const fs = require('fs')

const args = process.argv.slice(2)
const jsonOutput = args.includes('--json')

// Parse translation file
function parseTranslationFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const match = content.match(/export default ({[\s\S]*})\s*$/)
  if (!match) {
    throw new Error(`Could not parse ${filePath}`)
  }
  return eval('(' + match[1] + ')')
}

// Flatten all keys with dot notation
function flattenKeys(obj, prefix = '') {
  const keys = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? prefix + '.' + key : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...flattenKeys(obj[key], fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

// Parse both files
const enObj = parseTranslationFile('apps/georgeai-webapp/src/i18n/en.ts')
const deObj = parseTranslationFile('apps/georgeai-webapp/src/i18n/de.ts')

const enKeys = new Set(flattenKeys(enObj))
const deKeys = new Set(flattenKeys(deObj))

// Find differences
const missingInDe = [...enKeys].filter((k) => !deKeys.has(k))
const missingInEn = [...deKeys].filter((k) => !enKeys.has(k))

if (jsonOutput) {
  console.log(
    JSON.stringify(
      {
        enKeyCount: enKeys.size,
        deKeyCount: deKeys.size,
        missingInDe: missingInDe.sort(),
        missingInEn: missingInEn.sort(),
      },
      null,
      2,
    ),
  )
} else {
  console.log('Translation File Comparison')
  console.log('===========================\n')

  console.log(`English (en.ts): ${enKeys.size} keys`)
  console.log(`German (de.ts):  ${deKeys.size} keys\n`)

  if (missingInDe.length > 0) {
    console.log(`Keys missing in de.ts (${missingInDe.length}):`)
    missingInDe.sort().forEach((k) => console.log(`  - ${k}`))
    console.log()
  } else {
    console.log('✓ All English keys are present in German translation\n')
  }

  if (missingInEn.length > 0) {
    console.log(`Keys missing in en.ts (${missingInEn.length}):`)
    missingInEn.sort().forEach((k) => console.log(`  - ${k}`))
    console.log()
  } else {
    console.log('✓ All German keys are present in English translation\n')
  }

  if (missingInDe.length === 0 && missingInEn.length === 0) {
    console.log('✓ Translation files are in sync!')
  }
}
