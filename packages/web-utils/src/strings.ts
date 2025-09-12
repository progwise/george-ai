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

  // Check pattern sizes from 1 to 20 (increased from 5 to handle larger patterns)
  for (let patternSize = 1; patternSize <= 100; patternSize++) {
    // Need at least minConsecutiveRepeats * patternSize lines to detect repetition
    const requiredLines = minConsecutiveRepeats * patternSize
    if (lines.length < requiredLines) continue

    const slices = Array.from({ length: minConsecutiveRepeats }, (_, i) =>
      lines.slice(lines.length - patternSize * (i + 1), lines.length - patternSize * (i + 1) + patternSize).join('\n'),
    )

    const lastPattern = slices[0]
    if (slices.every((s) => s === lastPattern)) {
      return true
    }
  }
  return false
}
