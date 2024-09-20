import cors from 'cors'
import express from 'express'
import { handleUserInput } from './api-agent.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.post('/api/chat', async (req, res) => {
  try {
    const { input } = req.body
    if (!input) {
      return res.status(400).json({ error: 'Input is required' })
    }

    const response = await handleUserInput(input)
    res.json({ response })
  } catch (error) {
    console.error('Error handling input:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while processing your request' })
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`)
})
