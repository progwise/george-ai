interface CreateTimeoutOptions {
  timeoutMs: number
  onTimeout: () => void | Promise<void>
}

export const createTimeoutSignal = ({ timeoutMs, onTimeout }: CreateTimeoutOptions) => {
  const timeoutController = new AbortController()
  const timeoutSignal = timeoutController.signal

  const timeout = setTimeout(async () => {
    timeoutController.abort()
    await onTimeout()
  }, timeoutMs)
  return { timeoutSignal, clearTimeoutSignal: () => clearTimeout(timeout) }
}
