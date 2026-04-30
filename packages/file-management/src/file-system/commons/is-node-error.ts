/**
 * Helper to check if an error is a Node.js System Error (ErrnoException)
 */
export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}
