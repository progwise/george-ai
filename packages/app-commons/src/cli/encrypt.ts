#!/usr/bin/env node
/**
 * CLI utility to encrypt values using the project's encryption system.
 *
 * Usage:
 *   pnpm encrypt <value>
 *
 * Example:
 *   pnpm encrypt my-secret-api-key
 *
 * Requires ENCRYPTION_KEY environment variable to be set (64 hex characters).
 */
import { encryptValue } from '../encryption'

const value = process.argv[2]

if (!value) {
  console.error('Usage: pnpm encrypt <value>')
  console.error('')
  console.error('Example:')
  console.error('  pnpm encrypt my-secret-api-key')
  console.error('')
  console.error('Requires ENCRYPTION_KEY environment variable (64 hex characters)')
  process.exit(1)
}

try {
  const encrypted = encryptValue(value)
  console.log(encrypted)
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message)
  } else {
    console.error('Error:', error)
  }
  process.exit(1)
}
