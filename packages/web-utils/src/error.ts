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

export const getErrorString = (error: unknown): string => {
  const errorObject = getErrorObject(error)
  return JSON.stringify(errorObject, null, 2)
}
