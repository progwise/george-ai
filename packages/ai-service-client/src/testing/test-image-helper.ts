import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Utility to load test images for Ollama vision model tests
 */
export class TestImages {
  private static cache = new Map<string, string>()

  /**
   * Get pharmaceutical packaging image as base64 (without data URL prefix)
   */
  static getImage(fileName: string): string {
    return this.loadImage(join(__dirname, fileName))
  }

  /**
   * Create a small invalid PNG for testing error handling
   */
  static getInvalidImage(): string {
    // This is a malformed PNG that should cause an error
    return 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQIHWP8//8/AzYwiqHBgA0OAABCWgEHw8oWBQAAAABJRU5ErkJggg=='
  }

  /**
   * Load an image file and convert to base64 (cached)
   */
  private static loadImage(filePath: string): string {
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath)!
    }

    try {
      const buffer = readFileSync(filePath)
      const base64 = buffer.toString('base64')
      this.cache.set(filePath, base64)
      return base64
    } catch (error) {
      throw new Error(`Failed to load test image ${filePath}: ${error}`)
    }
  }
}
