export const dateString = (input: string | null | undefined) => {
  if (!input) {
    return ''
  }
  const data = new Date(input)
  return data.toLocaleDateString() || ''
}

export const dateTimeString = (input: string | null | undefined) => {
  if (!input) {
    return ''
  }
  const data = new Date(input)
  return data.toLocaleString() || ''
}
