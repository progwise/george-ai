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

export const dateTimeStringArray = (input: string | null | undefined, language: string) => {
  return [dateString(input, language), timeString(input, language)]
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
    second: '2-digit',
  })
}

export const duration = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start) {
    return 'not started'
  }
  const startDate = new Date(start)
  const endDate = new Date(end ?? Date.now())

  const diffInSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
  const hours = Math.floor(diffInSeconds / 3600)
  const minutes = Math.floor((diffInSeconds % 3600) / 60)
  const seconds = diffInSeconds % 60

  if (hours === 0 && minutes === 0) {
    return `${seconds}s`
  }
  if (hours === 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${hours}h ${minutes}m ${seconds}s`
}
