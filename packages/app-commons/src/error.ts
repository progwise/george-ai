export const getErrorObject = (error: unknown): object => {
  if (error instanceof Error) {
    const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error))
    return JSON.parse(errorString)
  }
  if (typeof error === 'string') {
    return { error }
  }

  const result = {}

  return Object.assign(result, error || {})
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'object' && error !== null) {
    const entries = Object.entries(error)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}:${value}`
        }
        return null
      })
      .filter((result) => result !== null)

    return entries.join(', ')
  }
  return String(error)
}
