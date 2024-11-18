// Import necessary modules
import express from 'express'
import bodyParser from 'body-parser'
import { createChatSystem } from './chatAgent.js'

const app = express()
const port = 3000

// Middleware for parsing JSON requests
app.use(bodyParser.json())

let chatChain

// Initialize the chat system
const initializeChatSystem = async () => {
  console.log('Initializing George-AI chat system...')
  chatChain = await createChatSystem()
  console.log('George-AI chat system initialized.')
}

// REST API endpoint to handle chat queries
app.post('/api/chat', async (req, res) => {
  const { sessionId, question } = req.body

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' })
  }

  try {
    const response = await chatChain.invoke(
      { question },
      { configurable: { sessionId: sessionId || 'default_session' } },
    )

    res.json({ response })
  } catch (error) {
    console.error('Error processing chat request:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while processing your request.' })
  }
})

// Start the server after initializing the chat system
initializeChatSystem()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to initialize chat system:', error)
    process.exit(1)
  })
