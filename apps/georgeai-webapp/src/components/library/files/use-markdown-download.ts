import { useEffect, useState } from 'react'

import { logger } from '../common'

export const useMarkdownDownload = ({
  url,
  chunkSize = 100 * 1024, // 100KB chunks
}: {
  url: string | undefined | null
  chunkSize?: number
}) => {
  const [markdown, setMarkdown] = useState<string>('')
  const [bytesLoaded, setBytesLoaded] = useState(0)
  const [totalBytes, setTotalBytes] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!url) return
    if (error) return // Don't attempt to download if there's already an error
    const timeouts = Array<NodeJS.Timeout>()
    const controller = new AbortController()
    const downloadMarkdown = async (downloadUrl: string) => {
      console.log('Starting markdown download from URL:', downloadUrl) // Debug log
      try {
        const response = await fetch(downloadUrl, {
          credentials: 'include',
          signal: controller.signal,
        })

        // eslint-disable-next-line @eslint-react/web-api/no-leaked-timeout
        await new Promise((resolve) => timeouts.push(setTimeout(resolve, 500))) // Simulate network delay for testing

        if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`)

        const reader = response.body?.getReader()
        if (!reader) throw new Error('Stream not available')

        const contentLength = response.headers.get('Content-Length')
        setTotalBytes(contentLength ? parseInt(contentLength, 10) : 0)

        const decoder = new TextDecoder()
        let accumulatedContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          // eslint-disable-next-line @eslint-react/web-api/no-leaked-timeout
          await new Promise((resolve) => timeouts.push(setTimeout(resolve, 500))) // Simulate network delay for testing

          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk
          setBytesLoaded((prev) => prev + value.length)

          // Update content every chunkSize bytes for progressive rendering
          if (accumulatedContent.length % chunkSize < chunk.length) {
            setMarkdown(accumulatedContent)
          }
        }
        // eslint-disable-next-line @eslint-react/web-api/no-leaked-timeout
        await new Promise((resolve) => timeouts.push(setTimeout(resolve, 500))) // Simulate network delay for testing

        setMarkdown(accumulatedContent) // Final update
      } catch (err) {
        logger.error('Error downloading markdown file:', err, { url: downloadUrl })
        controller.abort(err)
        // Ignore AbortErrors (expected when component unmounts or URL changes)
        if ((err as Error).name !== 'AbortError') {
          setError(err as Error)
        }
      } finally {
        timeouts.forEach(clearTimeout) // Clear any pending timeouts when download completes or fails
      }
    }

    downloadMarkdown(url)

    return () => {
      controller.abort() // Cancel fetch on unmount or URL change
      timeouts.forEach(clearTimeout) // Clear any pending timeouts on unmount or URL change
      console.log('Aborted markdown download and cleared timeouts for URL:', url) // Debug log
    }
  }, [url, chunkSize, error]) // Added markdown, error, and totalBytes to dependencies for better debugging

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      console.log('URL changed, resetting markdown state') // Debug log
      setMarkdown('')
      setBytesLoaded(0)
      setTotalBytes(0)
      setError(null)
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [url]) // Debug effect to log markdown updates

  return {
    markdown,
    bytesLoaded,
    totalBytes,
    progress: totalBytes > 0 ? (bytesLoaded / totalBytes) * 100 : 0,
    isLoading: bytesLoaded < totalBytes && !error,
    error,
  }
}
