/**
 * Find unused translation keys in the codebase
 *
 * Usage: node scripts/find-unused-translations.js [--verbose] [--json] [--delete]
 *
 * Options:
 *   --verbose  Show which files use each key
 *   --json     Output results as JSON
 *   --delete   Remove unused keys from en.ts and de.ts (use with caution!)
 *
 * This script analyzes translation keys in en.ts and checks if they are used
 * anywhere in the webapp source code (apps/georgeai-webapp/src, excluding the i18n folder).
 *
 * Note: Translation files are only used in the webapp, not in backend packages.
 *
 * Some keys may be false positives if they are dynamically constructed
 * (e.g., t('actions.' + action)).
 */

const fs = require('fs')
const { execSync } = require('child_process')

const args = process.argv.slice(2)
const verbose = args.includes('--verbose')
const jsonOutput = args.includes('--json')
const deleteUnused = args.includes('--delete')

// Read the English translation file
const enPath = 'apps/georgeai-webapp/src/i18n/en.ts'
const enContent = fs.readFileSync(enPath, 'utf8')

// Extract the object
const enMatch = enContent.match(/export default ({[\s\S]*})\s*$/)
let enObj
try {
  enObj = eval('(' + enMatch[1] + ')')
} catch (e) {
  console.error('Failed to parse en.ts:', e.message)
  process.exit(1)
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

const allKeys = flattenKeys(enObj)

if (!jsonOutput) {
  console.log('Total translation keys:', allKeys.length)
  console.log('Analyzing usage...\n')
}

// Check each key for usage
const unusedKeys = []
const usedKeys = []
const srcDir = 'apps/georgeai-webapp/src'

for (const key of allKeys) {
  let found = false

  try {
    // Search for all translation function patterns:
    // - t('key') or t("key")
    // - translate('key') or translate("key")
    const patterns = [
      `t('${key}'`,
      `t("${key}"`,
      `translate('${key}'`,
      `translate("${key}"`,
    ]

    for (const pattern of patterns) {
      const result = execSync(
        `grep -rF --include='*.ts' --include='*.tsx' "${pattern}" ${srcDir} 2>/dev/null | grep -v '/i18n/' || true`,
        { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
      ).trim()

      if (result) {
        found = true
        if (verbose) {
          usedKeys.push({ key, files: result.split('\n') })
        }
        break
      }
    }
  } catch (e) {
    // grep returns non-zero if no matches
  }

  // If not found directly, check if a parent key pattern is used dynamically
  // e.g., t(`actions.${action}`) would use actions.* keys
  if (!found) {
    const keyParts = key.split('.')
    for (let i = keyParts.length - 1; i > 0; i--) {
      const parentKey = keyParts.slice(0, i).join('.')
      try {
        // Look for dynamic key patterns like t(`parentKey.${var}`) or translate(`parentKey.${var}`)
        // Use single quotes to avoid shell interpretation of backticks
        const dynamicPatterns = [
          "t(\\`" + parentKey + ".",
          "translate(\\`" + parentKey + ".",
        ]

        for (const pattern of dynamicPatterns) {
          const result = execSync(
            "grep -rF --include='*.ts' --include='*.tsx' '" + pattern + "' " + srcDir + " 2>/dev/null | grep -v '/i18n/' || true",
            { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
          ).trim()
          if (result) {
            found = true
            break
          }
        }
        if (found) break
      } catch (e) {
        // ignore
      }
    }
  }

  if (!found) {
    unusedKeys.push(key)
  }
}

// Group unused keys by top-level category
const groupedUnused = {}
for (const key of unusedKeys) {
  const category = key.split('.')[0]
  if (!groupedUnused[category]) {
    groupedUnused[category] = []
  }
  groupedUnused[category].push(key)
}

// Delete unused keys from translation files
if (deleteUnused && unusedKeys.length > 0) {
  const files = ['apps/georgeai-webapp/src/i18n/en.ts', 'apps/georgeai-webapp/src/i18n/de.ts']

  // Helper to remove keys from nested object
  function removeKeys(obj, keysToRemove) {
    const keySet = new Set(keysToRemove)

    function removeRecursive(current, prefix = '') {
      const keysToDelete = []

      for (const key of Object.keys(current)) {
        const fullKey = prefix ? prefix + '.' + key : key

        if (typeof current[key] === 'object' && current[key] !== null) {
          removeRecursive(current[key], fullKey)
          // Remove empty objects
          if (Object.keys(current[key]).length === 0) {
            keysToDelete.push(key)
          }
        } else if (keySet.has(fullKey)) {
          keysToDelete.push(key)
        }
      }

      for (const key of keysToDelete) {
        delete current[key]
      }
    }

    removeRecursive(obj)
    return obj
  }

  // Helper to convert object to TypeScript export string
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

  // Helper to parse translation file
  function parseTranslationFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const match = content.match(/export default ({[\s\S]*})\s*$/)
    if (!match) {
      throw new Error(`Could not parse ${filePath}`)
    }
    return eval('(' + match[1] + ')')
  }

  for (const filePath of files) {
    try {
      const obj = parseTranslationFile(filePath)
      removeKeys(obj, unusedKeys)
      const output = 'export default {\n' + objectToTS(obj) + '\n}\n'
      fs.writeFileSync(filePath, output)
      console.log(`✓ Removed ${unusedKeys.length} unused keys from ${filePath}`)
    } catch (e) {
      console.error(`✗ Failed to update ${filePath}: ${e.message}`)
    }
  }

  console.log('\nDone! Run "pnpm format" to apply Prettier formatting.')
  console.log('Then run "node scripts/sort-translations.js" to sort the files.')
} else if (jsonOutput) {
  console.log(
    JSON.stringify(
      {
        totalKeys: allKeys.length,
        unusedCount: unusedKeys.length,
        unusedKeys,
        groupedByCategory: groupedUnused,
      },
      null,
      2,
    ),
  )
} else {
  console.log('Potentially unused keys (' + unusedKeys.length + '):\n')

  for (const category of Object.keys(groupedUnused).sort()) {
    console.log(`${category} (${groupedUnused[category].length}):`)
    groupedUnused[category].forEach((k) => console.log(`  - ${k}`))
    console.log()
  }

  console.log('\n--- Summary ---')
  console.log(`Total keys: ${allKeys.length}`)
  console.log(`Potentially unused: ${unusedKeys.length}`)
  console.log(`Usage rate: ${(((allKeys.length - unusedKeys.length) / allKeys.length) * 100).toFixed(1)}%`)

  if (unusedKeys.length > 0) {
    console.log('\nTo delete these keys, run: node scripts/find-unused-translations.js --delete')
  }
}
