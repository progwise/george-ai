export const getErrorObject = (error: unknown): object => {
  if (error instanceof Error) {
    const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error))
    return JSON.parse(errorString)
  }
  if (typeof error === 'object' && error !== null) {
    return error
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

export const getErrorMeta = (error: unknown): { errorMessage: string; errorCode?: string } => {
  const errorMessage = getErrorMessage(error)
  const errorObject = getErrorObject(error)
  const errorCode =
    'code' in errorObject
      ? String(errorObject.code)
      : 'errorCode' in errorObject
        ? String(errorObject.errorCode)
        : 'statusCode' in errorObject
          ? String(errorObject.statusCode)
          : undefined
  return { errorMessage, errorCode }
}
