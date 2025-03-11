export const dateString = (input: string | null | undefined, language: string) => {
  if (!input) {
    return ''
  }
  const data = new Date(input)
  return data.toLocaleDateString(language) || ''
}

export const dateTimeString = (input: string | null | undefined, language: string) => {
  if (!input) {
    return ''
  }
  const data = new Date(input)
  return data.toLocaleString(language) || ''
}
