interface CreateTimeoutOptions {
  timeoutMs: number
  onTimeout: () => void | Promise<void>
}

export const createTimeoutSignal = ({ timeoutMs, onTimeout }: CreateTimeoutOptions) => {
  const timeoutController = new AbortController()
  const timeoutSignal = timeoutController.signal

  const timeout = setTimeout(async () => {
    timeoutController.abort()
    try {
      await onTimeout()
    } catch (error) {
      console.error('Error in onTimeout callback', error)
    }
  }, timeoutMs)
  return { timeoutSignal, clearTimeoutSignal: () => clearTimeout(timeout) }
}
