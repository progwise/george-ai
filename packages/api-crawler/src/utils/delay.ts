/**
 * Delay utility for rate limiting
 */

/**
 * Sleep for specified milliseconds
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
