import fs from 'fs'

import { splitMarkdown } from './packages/langchain-chat/src/split-markdown.js'

// Test the markdown splitting first
const testMarkdownPath =
  './apps/georgeai-server/.uploads/cmdfkas0q0007s56kt9xqg5ny/cmdfkkdz1000cs5cqe2gb7wj9/converted.md'

console.log('🧪 Testing markdown splitting...')

if (fs.existsSync(testMarkdownPath)) {
  console.log('✅ File found:', testMarkdownPath)

  try {
    const chunks = splitMarkdown(testMarkdownPath)
    console.log(`📝 Split into ${chunks.length} chunks`)

    // Show first chunk as example
    if (chunks.length > 0) {
      console.log('\n📋 First chunk preview:')
      console.log('Section:', chunks[0].metadata.section)
      console.log('Content length:', chunks[0].pageContent.length)
      console.log('Content preview:', chunks[0].pageContent.substring(0, 200) + '...')
    }
  } catch (error) {
    console.error('❌ Error splitting markdown:', error)
  }
} else {
  console.log('❌ File not found:', testMarkdownPath)
}
