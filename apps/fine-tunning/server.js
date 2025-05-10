import express from 'express'
import { spawn } from 'child_process'

const app = express()
app.use(express.json())

app.post('/generate', (req, res) => {
  const { model, prompt, maxTokens } = req.body

  const args = [
    '-m',
    'mlx_lm.generate',
    '--model',
    model,
    '--prompt',
    prompt,
    '--max-tokens',
    maxTokens?.toString() || '500'
  ]

  const python = spawn('python3', args)

  let output = ''
  let error = ''

  python.stdout.on('data', (data) => {
    output += data.toString()
  })

  python.stderr.on('data', (data) => {
    error += data.toString()
  })

  python.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error })
    }
    return res.json({ output: output.trim() })
  })
})

app.listen(3000, () => {
  console.log('API listening on http://localhost:3000')
})
