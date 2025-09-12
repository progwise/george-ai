import { describe, expect, it } from 'vitest'

import { type OllamaStreamChunk, getChatResponseStream } from './ollama-api'
import { getTestImage } from './testing/test-image-helper'

const instances = process.env.OLLAMA_BASE_URL
  ? [{ url: process.env.OLLAMA_BASE_URL, apiKey: process.env.OLLAMA_API_KEY! }]
  : []
const modelNames = process.env.MODEL_NAME_VL ? [process.env.MODEL_NAME_VL] : []
// Models to test with - add your own vision-capable models here for testing
// const fileNames = ['cat-medium.png', 'page-1.png', 'page-2.png', 'page-3.png']
const fileNames = ['cat-medium.png']

describe.each(instances)('ollama vision streaming tests for ollama %s', (instance) => {
  // Helper function to load image as base64

  describe('vision model streaming', () => {
    it.each(modelNames)(
      'should analyze a photo with model %s',
      async (modelName) => {
        const catImage = await getTestImage('cat-medium.png')

        const stream = await getChatResponseStream(instance, modelName, [
          { role: 'user', content: 'Describe this image', images: [catImage] },
        ])

        expect(stream).toBeDefined()

        // Process the stream
        const reader = stream.getReader()
        const chunks: OllamaStreamChunk[] = []
        let totalContent = ''

        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break

            if (value) {
              chunks.push(value)

              expect(value.error).toBeUndefined() // Fail immediately on error chunks

              if (value.message?.content) {
                totalContent += value.message.content
              }
            }
          }
        } finally {
          reader.releaseLock()
        }

        console.log(`Cat image analysis (${instance.url}):`, totalContent)
        console.log(JSON.stringify(chunks[chunks.length - 1], null, 2))

        expect(chunks.length).toBeGreaterThan(0)
        expect(chunks[chunks.length - 1].done).toBe(true)
        expect(totalContent.length).toBeGreaterThan(0)

        // Should mention cat
        expect(totalContent.toLowerCase()).toMatch(/cat/i)
      },
      30000,
    )

    // Test for parallel execution
    // Skipped by default as this is a heavy test - remove .skip to enable
    it.skip.each([modelNames])(
      'should analyze a packaging image in parallel %s',
      async (model) => {
        // Load the pharmaceutical packaging image
        const pharmaceuticalImage = await getTestImage('page-1.png')

        const runAnalysis = async (number: number) => {
          console.log(`Run ${number} - Analyzing pharmaceutical image with model ${model} on ${instance.url}`)
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000 * number)) // Staggered start
          const stream = await getChatResponseStream(instance, model, [
            {
              role: 'user',
              content:
                'Analyze this pharmaceutical packaging image. What product is this and what key information can you extract?',
              images: [pharmaceuticalImage],
            },
          ])

          expect(stream).toBeDefined()

          // Process the stream
          const reader = stream.getReader()
          const chunks: OllamaStreamChunk[] = []
          let totalContent = ''

          try {
            while (true) {
              const { value, done } = await reader.read()
              if (done) break

              if (value) {
                chunks.push(value)

                // Fail immediately on error chunks
                expect(value.error).toBeUndefined()

                totalContent += value.message?.content
              }
            }
          } catch (error) {
            console.error(`Error during analysis run ${number} with model ${model}`, error)
            throw error
          } finally {
            reader.releaseLock()
          }

          console.log(`Pharmaceutical analysis (${instance.url}):`, totalContent)
          console.log(JSON.stringify(chunks[chunks.length - 1], null, 2))

          expect(chunks.length).toBeGreaterThan(0)
          expect(chunks[chunks.length - 1].done).toBe(true)
          expect(totalContent.length).toBeGreaterThan(0)

          // Should mention pharmaceutical/medical content
          expect(totalContent.toLowerCase()).toMatch(/pharma|medical|drug|medicine|tablet|zyprexa|olanzapin/i)
          return chunks[chunks.length - 1]
        }

        const promises = Array(10).map(() => runAnalysis)
        console.log('Starting parallel runs...', promises.length)
        const results = await Promise.allSettled(Array.from({ length: 12 }).map((_, index) => runAnalysis(index)))

        const failures = results.filter((r) => r.status === 'rejected')
        if (failures.length) {
          console.error('Some runs failed:', failures)
        }
        expect(failures.length).toBe(0)
      },
      180000,
    )

    describe.each(fileNames)('test multiple images %s', (fileName) => {
      it.each(modelNames)(
        `should analyze model %s`,
        async (model) => {
          const image = await getTestImage(fileName)

          const stream = await getChatResponseStream(instance, model, [
            { role: 'user', content: 'Describe this image', images: [image] },
          ])

          expect(stream).toBeDefined()

          // Process the stream
          const reader = stream.getReader()
          const chunks: OllamaStreamChunk[] = []
          let totalContent = ''

          try {
            while (true) {
              const { value, done } = await reader.read()
              if (done) break

              if (value) {
                chunks.push(value)

                expect(value.error).toBeUndefined() // Fail immediately on error chunks

                totalContent += value.message?.content
              }
            }
          } finally {
            reader.releaseLock()
          }

          console.log(`Image ${fileName} analysis (${instance.url}):`, totalContent)
          console.log(JSON.stringify(chunks[chunks.length - 1], null, 2))

          expect(chunks.length).toBeGreaterThan(0)
          expect(chunks[chunks.length - 1].done).toBe(true)
          expect(totalContent.length).toBeGreaterThan(0)
        },
        300000,
      )
    })

    it.each(modelNames)(
      'should handle multiple images in conversation with model %s',
      async (model) => {
        // Load both images
        const image1 = await getTestImage('cat-medium.png')
        const image2 = await getTestImage('vancouver-medium.png')

        // First message with pharmaceutical image
        const stream = await getChatResponseStream(instance, model, [
          {
            role: 'user',
            content: 'Compare this 2 images?',
            images: [image1, image2],
          },
        ])

        // Process first stream
        const reader1 = stream.getReader()
        let content = ''

        try {
          while (true) {
            const { value, done } = await reader1.read()
            if (done) break

            expect(value?.error).toBeUndefined() // Fail immediately on error chunks

            content += value.message?.content
          }
        } finally {
          reader1.releaseLock()
        }

        console.log(`Multi-image analysis (${instance.url}):`, content)
        // Both should be different responses
        expect(content).toContain('cat')
        expect(content).toContain('city')
      },
      90000,
    )

    it.each(modelNames)(
      'should fail fast on invalid image format with model %s',
      async (model) => {
        // Create an invalid base64 image (corrupted/malformed)
        const invalidImage =
          'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQIHWP8//8/AzYwiqHBgA0OAABCWgEHw8oWBQAAAABJRU5ErkJggg=='

        const stream = await getChatResponseStream(instance, model, [
          {
            role: 'user',
            content: 'Describe this image',
            images: [invalidImage],
          },
        ])

        expect(stream).toBeDefined()

        // Process the stream - this should throw when an error chunk is received
        const reader = stream.getReader()

        await expect(async () => {
          try {
            while (true) {
              const { value, done } = await reader.read()
              if (done) break

              if (value?.error) {
                throw new Error(`Ollama vision model error: ${value.error}`)
              }
            }
          } finally {
            reader.releaseLock()
          }
        }).rejects.toThrow(/Ollama vision model error/)
      },
      30000,
    )
  })
})
