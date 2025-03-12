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

export const dateStringShort = (input: string | null | undefined, language: string) => {
  if (!input) {
    return ''
  }
  const data = new Date(input)
  return data.toLocaleDateString(language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const dateTimeStringShort = (input: string | null | undefined, language: string) => {
  if (!input) {
    return ''
  }
  const data = new Date(input)
  return data.toLocaleString(language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const timeString = (input: string | null | undefined, language: string) => {
  if (!input) {
    return ''
  }
  const data = new Date(input)
  return data.toLocaleTimeString(language, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
