import { describe, expect, it } from 'vitest'

import { decryptValue, encryptValue } from './encryption'

// add .env under web-utils with your own encryption key (ENCRYPTION_KEY='ExampleKey') for testing

describe('encryptionToDecryption', () => {
  describe('testBasicFunctions', () => {
    it('should encrypt and then decrypt a value successfully', async () => {
      const secret = 'test-secret-123'
      const encryptedSecret = encryptValue(secret)

      expect(encryptedSecret).toBeTypeOf('string')
      expect(encryptedSecret).not.toBe(secret)
      expect(encryptedSecret!.startsWith('encrypted:')).toBe(true)

      const decryptedSecret = decryptValue(encryptedSecret!)

      expect(decryptedSecret).toBeTypeOf('string')
      expect(decryptedSecret).toBe(secret)
    }, 5000)

    it('should return encrypted', async () => {
      const preEncrypted = 'encrypted:0123456789abcdef:abcdef0123456789:deadbeef'
      const afterEncryption = encryptValue(preEncrypted)

      expect(afterEncryption).toBe(preEncrypted)
    }, 5000)

    it('handle null and undefined', async () => {
      const encryptedNull = encryptValue(null)
      const encryptedUndefined = encryptValue(undefined)

      expect(encryptedNull).toBeUndefined()
      expect(encryptedUndefined).toBeUndefined()
    }, 5000)

    it('samne value should return different encrypted keys, decrypted same', async () => {
      const encryptedValue1 = encryptValue('same-value')
      const encryptedValue2 = encryptValue('same-value')

      expect(encryptedValue1).not.toBe(encryptedValue2)
      expect(decryptValue(encryptedValue1!)).toBe(decryptValue(encryptedValue2!))
    }, 5000)
  })

  describe('forceErrors', () => {
    it('should fail with wrong encrypted key', async () => {
      const wrongApiKey = 'encrypted:123456789abcdef012345:6789a:bcdef0123456789abcdef0123456789abcdef'
      expect(() => decryptValue(wrongApiKey)).toThrow()
    }, 5000)

    it('should fail with wrong decrypted format', async () => {
      const wrongFormat = 'encrypted:onlytwo:parts'

      expect(() => decryptValue(wrongFormat)).toThrow()
    }, 5000)
  })
})
