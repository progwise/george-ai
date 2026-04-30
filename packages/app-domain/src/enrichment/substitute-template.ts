/**
 * Substitutes {{fieldName}} placeholders in a template string with actual field values
 * @param template - Template string with {{fieldName}} placeholders
 * @param contextFields - Array of context fields with their values
 * @returns Substituted string, or null if any required field is missing
 */
export function substituteTemplate(
  template: string,
  contextFields: Array<{ fieldName: string; value: string | null }>,
): string | null {
  let result = template
  const fieldMap = new Map(contextFields.map((f) => [f.fieldName.toLowerCase(), f.value]))

  // Find all {{fieldName}} placeholders
  const placeholderRegex = /\{\{([^}]+)\}\}/g
  const matches = [...template.matchAll(placeholderRegex)]

  for (const match of matches) {
    const fieldName = match[1].trim()
    const value = fieldMap.get(fieldName.toLowerCase())

    // If any required field is null/missing, return null
    if (value === null || value === undefined) {
      console.warn(`⚠️ Template substitution failed: field "${fieldName}" has no value`)
      return null
    }

    result = result.replace(match[0], value)
  }

  return result
}
