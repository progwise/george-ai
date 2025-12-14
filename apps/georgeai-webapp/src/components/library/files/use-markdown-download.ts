import { useEffect, useState } from 'react'

export const useMarkdownDownload = ({
  url,
  chunkSize = 100 * 1024, // 100KB chunks
}: {
  url: string | undefined
  chunkSize?: number
}) => {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [bytesLoaded, setBytesLoaded] = useState(0)
  const [totalBytes, setTotalBytes] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!url) return

    const controller = new AbortController()
    const downloadMarkdown = async () => {
      try {
        setIsLoading(true)
        setContent('')
        setBytesLoaded(0)

        const response = await fetch(url, {
          credentials: 'include',
          signal: controller.signal,
        })

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

          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk
          setBytesLoaded((prev) => prev + value.length)

          // Update content every chunkSize bytes for progressive rendering
          if (accumulatedContent.length % chunkSize < chunk.length) {
            setContent(accumulatedContent)
          }
        }

        setContent(accumulatedContent) // Final update
        setIsLoading(false)
      } catch (err) {
        // Ignore AbortErrors (expected when component unmounts or URL changes)
        if ((err as Error).name !== 'AbortError') {
          console.error('Error downloading markdown file:', err)
          setError(err as Error)
          setIsLoading(false)
        }
      }
    }

    downloadMarkdown()

    return () => controller.abort()
  }, [url, chunkSize])

  return {
    content,
    isLoading,
    bytesLoaded,
    totalBytes,
    progress: totalBytes > 0 ? (bytesLoaded / totalBytes) * 100 : 0,
    error,
  }
}
