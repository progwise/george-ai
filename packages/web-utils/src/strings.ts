// Helper function to convert comma-separated strings to arrays
export const parseCommaList = (value: string | undefined): string[] | undefined => {
  if (!value || !value.trim()) return undefined
  return value
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

// Helper functions to parse existing filter data
export const parseJsonArray = (jsonString: string | null | undefined) => {
  if (!jsonString) return []
  try {
    return JSON.parse(jsonString) || []
  } catch {
    return []
  }
}

export const jsonArrayToString = (jsonString: string | null | undefined) => {
  const stringArray = parseJsonArray(jsonString)
  return stringArray.join(', ')
}

export const formatFileSize = (bytes: number | null | undefined) => {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return mb.toString()
}

export const checkLineRepetition = (lines: string[], minConsecutiveRepeats: number = 5): boolean => {
  if (lines.length < 20) return false // Need at least 20 lines to check for repetition

  // Check pattern sizes from 1 to 5
  for (let patternSize = 1; patternSize <= 5; patternSize++) {
    // Need at least minConsecutiveRepeats * patternSize lines to detect repetition
    const requiredLines = minConsecutiveRepeats * patternSize
    if (lines.length < requiredLines) continue

    // Get the pattern from the end
    const pattern = lines.slice(-patternSize)

    // Check if this pattern repeats consecutively minConsecutiveRepeats times
    let consecutiveMatches = 0

    // Check backwards from the end in chunks of patternSize
    for (let i = lines.length - patternSize; i >= 0; i -= patternSize) {
      const segment = lines.slice(i, i + patternSize)

      // If segment is shorter than pattern size, we can't match
      if (segment.length < patternSize) break

      if (segment.join('') === pattern.join('')) {
        consecutiveMatches++
      } else {
        // Pattern broken, reset counter
        break
      }
    }

    if (consecutiveMatches >= minConsecutiveRepeats) {
      return true
    }
  }
  return false
}
