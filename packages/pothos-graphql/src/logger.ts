let counter = 0
export const logInfo = (message: string, data?: Record<string, any>) => {
  const timestamp = new Date().toISOString()
  console.info(`${counter++}:[${timestamp}] INFO: ${message}`)
  if (data) {
    console.info('Data:', JSON.stringify(data, null, 2))
  }
}

export const logError = (message: string, error: Error, data?: Record<string, any>) => {
  const timestamp = new Date().toISOString()
  console.error(`${counter++}:[${timestamp}] ERROR: ${message}`)
  console.error('Error:', error.message)
  if (data) {
    console.error('Data:', JSON.stringify(data, null, 2))
  }
}
