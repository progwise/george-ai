import fs, { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RELEASE_TAG = 'test-assets-v1.0'
const GITHUB_REPO = 'progwise/george-ai' // Update with your actual repo

const getCacheDir = () => {
  const cacheDir = path.join(__dirname, '.test-cache')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }
  return cacheDir
}

const downloadTestAsset = async (filename: string): Promise<string> => {
  const cacheDir = getCacheDir()
  const localPath = path.join(cacheDir, filename)

  // Return cached file if it exists
  if (fs.existsSync(localPath)) {
    return localPath
  }

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (!token) {
    throw new Error('GitHub token required for private repo access. Set GITHUB_TOKEN or GH_TOKEN environment variable.')
  }

  try {
    // Step 1: Get the release info to find the asset
    const releaseUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${RELEASE_TAG}`
    console.log(`Getting release info from ${releaseUrl}...`)
    
    const releaseResponse = await fetch(releaseUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'test-image-helper'
      }
    })

    if (!releaseResponse.ok) {
      throw new Error(`Failed to get release info: ${releaseResponse.statusText}`)
    }

    const release = await releaseResponse.json() as { assets: Array<{ name: string; id: number }> }
    const asset = release.assets.find(a => a.name === filename)
    
    if (!asset) {
      const availableAssets = release.assets.map(a => a.name).join(', ')
      throw new Error(`Asset ${filename} not found in release ${RELEASE_TAG}. Available assets: ${availableAssets}`)
    }

    // Step 2: Download the asset using the GitHub API
    const assetUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/assets/${asset.id}`
    console.log(`Downloading asset from ${assetUrl}...`)
    
    const assetResponse = await fetch(assetUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/octet-stream',
        'User-Agent': 'test-image-helper'
      }
    })

    if (!assetResponse.ok) {
      throw new Error(`Failed to download asset: ${assetResponse.statusText}`)
    }

    const arrayBuffer = await assetResponse.arrayBuffer()
    fs.writeFileSync(localPath, Buffer.from(arrayBuffer))

    console.log(`Downloaded test asset: ${filename} (${arrayBuffer.byteLength} bytes)`)
    return localPath
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to download test asset ${filename}: ${message}`)
  }
}

export const cleanupTestAssets = () => {
  const cacheDir = getCacheDir()
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true })
  }
}

export async function getTestImage(fileName: string) {
  const filePath = await downloadTestAsset(fileName)

  try {
    const buffer = readFileSync(filePath)
    const base64 = buffer.toString('base64')
    return base64
  } catch (error) {
    throw new Error(`Failed to load test image ${filePath}: ${error}`)
  }
}

export function getInvalidImage(): string {
  // This is a malformed PNG that should cause an error
  return 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQIHWP8//8/AzYwiqHBgA0OAABCWgEHw8oWBQAAAABJRU5ErkJggg=='
}
