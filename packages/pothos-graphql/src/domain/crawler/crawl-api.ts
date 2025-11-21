import fs from 'node:fs'

import { type ApiCrawlerConfig, crawlApiStream } from '@george-ai/api-crawler'
import { getUploadFilePath } from '@george-ai/file-management'

import { prisma } from '../../prisma'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

interface ApiCrawlOptions extends CrawlOptions {
  crawlerConfig: ApiCrawlerConfig
}

/**
 * Type for filename generator function
 * Takes a CrawlItem and returns a sanitized filename (without extension)
 */
type FilenameGenerator = (item: { title: string; content: string; raw: unknown }) => Promise<string>

/**
 * Type for markdown generator function
 * Takes a CrawlItem and returns formatted markdown content
 */
type MarkdownGenerator = (item: { title: string; content: string; raw: unknown }) => Promise<string>

/**
 * Default filename generator
 * Sanitizes the title for safe file system usage
 * Handles special characters, German umlauts, and limits length
 */
const defaultFilenameGenerator: FilenameGenerator = async (item) => {
  const filename = item.title || 'untitled'

  return (
    filename
      // Replace German umlauts
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/Ä/g, 'Ae')
      .replace(/Ö/g, 'Oe')
      .replace(/Ü/g, 'Ue')
      .replace(/ß/g, 'ss')
      // Replace spaces and special chars with dashes
      .replace(/[^a-zA-Z0-9]+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '')
      // Limit length
      .slice(0, 200)
      // Convert to lowercase
      .toLowerCase()
  )
}

/**
 * Default markdown generator
 * Formats the item as structured markdown with title and raw data
 */
const defaultMarkdownGenerator: MarkdownGenerator = async (item) => {
  // Convert raw object to markdown-friendly format
  let dataSection = ''

  if (item.raw && typeof item.raw === 'object') {
    const entries = Object.entries(item.raw)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => {
        // Format complex values nicely
        if (typeof value === 'object') {
          return `- **${key}**: ${JSON.stringify(value, null, 2)}`
        }
        return `- **${key}**: ${String(value)}`
      })

    if (entries.length > 0) {
      dataSection = `---\n\n## Data\n\n${entries.join('\n')}`
    }
  }

  return `# ${item.title}

${item.content || 'No description available'}

${dataSection}
`
}

const saveApiCrawlerFile = async ({
  fileName,
  markdownContent,
  libraryId,
  crawlerId,
  originUri,
}: {
  fileName: string
  markdownContent: string
  libraryId: string
  crawlerId: string
  originUri: string
}) => {
  const fileUpdateData = {
    name: fileName,
    mimeType: 'text/markdown',
    libraryId,
  }

  const file = await prisma.aiLibraryFile.upsert({
    where: {
      crawledByCrawlerId_originUri: {
        crawledByCrawlerId: crawlerId,
        originUri,
      },
    },
    create: {
      ...fileUpdateData,
      originUri,
      crawledByCrawlerId: crawlerId,
    },
    update: fileUpdateData,
  })

  const uploadedFilePath = getUploadFilePath({ fileId: file.id, libraryId })
  await fs.promises.writeFile(uploadedFilePath, markdownContent)

  return file
}

export async function* crawlApi({
  libraryId,
  crawlerId,
  crawlerConfig,
  generateFilename = defaultFilenameGenerator,
  generateMarkdown = defaultMarkdownGenerator,
}: ApiCrawlOptions & {
  generateFilename?: FilenameGenerator
  generateMarkdown?: MarkdownGenerator
}): AsyncGenerator<CrawledFileInfo, void, void> {
  console.log(`Start API crawling for crawler ${crawlerId}`)

  try {
    if (!crawlerConfig) {
      throw new Error('Missing crawlerConfig for API crawler')
    }

    // Validate config is ApiCrawlerConfig type
    const config = crawlerConfig as ApiCrawlerConfig

    if (!config.baseUrl || !config.endpoint) {
      throw new Error('Invalid API crawler config: missing baseUrl or endpoint')
    }

    console.log(`Crawling API: ${config.baseUrl}${config.endpoint}`)
    console.log(`API Config:`, JSON.stringify(config, null, 2))

    let itemCount = 0

    // Stream items as they are fetched
    for await (const item of crawlApiStream(config)) {
      try {
        itemCount++

        // Use transformation functions to generate filename and markdown
        const sanitizedFilename = await generateFilename(item)
        const fileNameWithExt = `${sanitizedFilename}.md`
        const markdownContent = await generateMarkdown(item)

        // Extract originUri from raw data (try common URL/ID fields)
        let originUri = item.title || `item-${itemCount}`
        if (item.raw && typeof item.raw === 'object') {
          const rawObj = item.raw as Record<string, unknown>
          originUri =
            (rawObj.url as string | undefined) ||
            (rawObj.id as string | undefined) ||
            (rawObj.sku as string | undefined) ||
            item.title ||
            `item-${itemCount}`
        }

        const file = await saveApiCrawlerFile({
          fileName: fileNameWithExt,
          markdownContent,
          libraryId,
          crawlerId,
          originUri: String(originUri),
        })

        yield {
          ...file,
          hints: `API Crawler ${crawlerId} successfully crawled item ${file.id}`,
        }

        console.log(`Successfully saved API crawled item ${itemCount}: ${fileNameWithExt}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Error saving API crawled item:`, errorMessage)
        yield {
          errorMessage: `Failed to save item "${item.title}": ${errorMessage}`,
        }
      }
    }

    console.log(`Finished API crawling for crawler ${crawlerId}. Total items: ${itemCount}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in API crawler:', errorMessage)
    yield { errorMessage }
  }
}
