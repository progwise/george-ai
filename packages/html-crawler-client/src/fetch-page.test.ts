import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchPageAsMarkdown } from './fetch-page'
import { HtmlCrawlError } from './types'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('fetchPageAsMarkdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return markdown content on successful response', async () => {
    const mockResponse = {
      success: true,
      url: 'https://example.com',
      title: 'Example Page',
      markdown: '# Example\n\nThis is example content.',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchPageAsMarkdown('https://example.com')

    expect(result).toBe('# Example\n\nThis is example content.')
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/markdown?url=https%3A%2F%2Fexample.com'),
      expect.objectContaining({
        method: 'GET',
        headers: { Accept: 'application/json' },
      }),
    )
  })

  it('should throw HtmlCrawlError when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchPageAsMarkdown('https://example.com')).rejects.toThrow(
      new HtmlCrawlError('Crawl4AI HTTP 500: Internal Server Error', 'https://example.com'),
    )
  })

  it('should throw HtmlCrawlError when crawl fails', async () => {
    const mockResponse = {
      success: false,
      error: 'Page blocked by robots.txt',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    await expect(fetchPageAsMarkdown('https://example.com')).rejects.toThrow(
      new HtmlCrawlError('Page blocked by robots.txt', 'https://example.com'),
    )
  })

  it('should throw HtmlCrawlError when markdown is empty', async () => {
    const mockResponse = {
      success: true,
      url: 'https://example.com',
      title: 'Example',
      markdown: '',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    await expect(fetchPageAsMarkdown('https://example.com')).rejects.toThrow(
      new HtmlCrawlError('Crawl4AI returned empty markdown', 'https://example.com'),
    )
  })

  it('should throw HtmlCrawlError on connection refused', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fetch failed: ECONNREFUSED'))

    await expect(fetchPageAsMarkdown('https://example.com')).rejects.toThrow('Crawl4AI service unavailable')
  })

  it('should throw HtmlCrawlError on timeout', async () => {
    // Create a promise that never resolves
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('The operation was aborted')
            error.name = 'AbortError'
            reject(error)
          }, 100)
        }),
    )

    const promise = fetchPageAsMarkdown('https://example.com', 50)
    vi.advanceTimersByTime(100)

    await expect(promise).rejects.toThrow(HtmlCrawlError)
  })

  it('should use custom timeout when provided', async () => {
    const mockResponse = {
      success: true,
      url: 'https://example.com',
      title: 'Example',
      markdown: '# Test',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    await fetchPageAsMarkdown('https://example.com', 60000)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it('should URL-encode the url parameter', async () => {
    const mockResponse = {
      success: true,
      url: 'https://example.com/path?query=value&other=123',
      title: 'Example',
      markdown: '# Test',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    await fetchPageAsMarkdown('https://example.com/path?query=value&other=123')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('https://example.com/path?query=value&other=123')),
      expect.any(Object),
    )
  })
})
