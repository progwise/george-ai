import { describe, expect, it } from 'vitest'

import { CrawlError } from './types'

describe('CrawlError', () => {
  it('should create error with message and url', () => {
    const error = new CrawlError('Something went wrong', 'https://example.com')

    expect(error.message).toBe('Something went wrong')
    expect(error.url).toBe('https://example.com')
    expect(error.name).toBe('CrawlError')
    expect(error.cause).toBeUndefined()
  })

  it('should create error with cause', () => {
    const cause = new Error('Network failure')
    const error = new CrawlError('Crawl failed', 'https://example.com', cause)

    expect(error.message).toBe('Crawl failed')
    expect(error.url).toBe('https://example.com')
    expect(error.cause).toBe(cause)
  })

  it('should be instance of Error', () => {
    const error = new CrawlError('Test error', 'https://example.com')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(CrawlError)
  })

  it('should have correct stack trace', () => {
    const error = new CrawlError('Test error', 'https://example.com')

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('CrawlError')
  })
})
