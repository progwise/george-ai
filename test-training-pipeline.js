#!/usr/bin/env node
// Simple test script to trigger the training data generation
import { embedFile } from './packages/langchain-chat/src/typesense-vectorstore.js'

const testFile = {
  id: 'cmdfkkdz1000cs5cqe2gb7wj9',
  name: 'Alan_Turing_Wikipedia.md',
  originUri: 'https://en.wikipedia.org/wiki/Alan_Turing',
  mimeType: 'text/markdown',
  path: './apps/georgeai-server/.uploads/cmdfkas0q0007s56kt9xqg5ny/cmdfkkdz1000cs5cqe2gb7wj9/converted.md',
}

const libraryId = 'cmdfkas0q0007s56kt9xqg5ny'

console.log('🚀 Testing the optimized training data pipeline...')
console.log('📄 Processing file:', testFile.name)
console.log('🔗 Original URL:', testFile.originUri)

try {
  const result = await embedFile(libraryId, testFile)

  console.log('\n✅ Training pipeline completed successfully!')
  console.log('📊 Results:')
  console.log(`   📝 Chunks processed: ${result.chunks}`)
  console.log(`   ❓ Total QA pairs: ${result.totalQAPairs}`)
  console.log(`   📂 Training data saved to: ${result.trainingDataPath}`)
  console.log(`   📄 Flat JSONL saved to: ${result.flatJsonlPath}`)
  console.log(`   📈 Training entries: ${result.trainingDataEntries}`)
} catch (error) {
  console.error('❌ Error running training pipeline:', error)
}
