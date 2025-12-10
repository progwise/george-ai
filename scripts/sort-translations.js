/**
 * Sort translation files alphabetically by key
 *
 * Usage: node scripts/sort-translations.js [--check]
 *
 * Options:
 *   --check  Only check if files are sorted, don't modify them
 *
 * This script sorts all keys alphabetically at every nesting level
 * in both en.ts and de.ts translation files.
 */

const fs = require('fs')

const args = process.argv.slice(2)
const checkOnly = args.includes('--check')

// Sort object keys alphabetically and recursively
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj
  }

  const sorted = {}
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b))

  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key])
  }

  return sorted
}

// Convert object to TypeScript export string
function objectToTS(obj, indent = 2) {
  const lines = []
  const keys = Object.keys(obj)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = obj[key]
    const isLast = i === keys.length - 1
    const comma = isLast ? '' : ','

    // Check if key needs quotes
    const needsQuotes = !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)
    const keyStr = needsQuotes ? "'" + key + "'" : key

    if (typeof value === 'string') {
      // Escape single quotes and newlines in strings
      const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
      lines.push(' '.repeat(indent) + keyStr + ": '" + escaped + "'" + comma)
    } else if (typeof value === 'object' && value !== null) {
      lines.push(' '.repeat(indent) + keyStr + ': {')
      lines.push(objectToTS(value, indent + 2))
      lines.push(' '.repeat(indent) + '}' + comma)
    }
  }

  return lines.join('\n')
}

// Parse translation file
function parseTranslationFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const match = content.match(/export default ({[\s\S]*})\s*$/)
  if (!match) {
    throw new Error(`Could not parse ${filePath}`)
  }
  return eval('(' + match[1] + ')')
}

// Check if object keys are sorted
function isSorted(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return true
  }

  const keys = Object.keys(obj)
  const sortedKeys = [...keys].sort((a, b) => a.localeCompare(b))

  for (let i = 0; i < keys.length; i++) {
    if (keys[i] !== sortedKeys[i]) {
      return false
    }
    if (!isSorted(obj[keys[i]])) {
      return false
    }
  }

  return true
}

const files = ['apps/georgeai-webapp/src/i18n/en.ts', 'apps/georgeai-webapp/src/i18n/de.ts']

let allSorted = true

for (const filePath of files) {
  const obj = parseTranslationFile(filePath)

  if (checkOnly) {
    const sorted = isSorted(obj)
    if (sorted) {
      console.log(`✓ ${filePath} is sorted`)
    } else {
      console.log(`✗ ${filePath} is NOT sorted`)
      allSorted = false
    }
  } else {
    const sortedObj = sortObjectKeys(obj)
    const output = 'export default {\n' + objectToTS(sortedObj) + '\n}\n'
    fs.writeFileSync(filePath, output)
    console.log(`✓ Sorted ${filePath}`)
  }
}

if (checkOnly && !allSorted) {
  console.log('\nRun "node scripts/sort-translations.js" to sort the files.')
  process.exit(1)
}

if (!checkOnly) {
  console.log('\nDone! Run "pnpm format" to apply Prettier formatting.')
}
