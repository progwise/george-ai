// Helper function to convert comma-separated strings to arrays
export const parseCommaList = (value: string | undefined): string[] | undefined => {
  if (!value || !value.trim()) return undefined
  return value
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}
