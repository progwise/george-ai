const express = require('express')
const { exec } = require('child_process')
const path = require('path')
const app = express()
app.use(express.json())

const PORT = 3000

app.post('/generate', async (req, res) => {
  const { model, prompt, adapterPath, maxTokens } = req.body

  if (!model || !prompt) {
    return res.status(400).json({ error: 'Missing required fields: model and prompt' })
  }

  const safePrompt = prompt.replace(/"/g, '\\"')
  const cmd = `python3 -m mlx_lm generate \
    --model "${model}" \
    --prompt "${safePrompt}" \
    --max-tokens ${maxTokens || 300} \
    ${adapterPath ? `--adapter-path ${adapterPath}` : ''}`

  console.log(`🚀 Generating response with:\n${cmd}`)

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Generation error:\n${stderr}`)
      return res.status(500).json({ error: stderr })
    }

    try {
      const rawParts = stdout.split(/(?:^|\r?\n)={10,}(?:\r?\n|$)/)
      const parts = rawParts.filter((p) => p.trim().length > 0)
      const generated = parts.length > 0 ? parts[0].trim() : stdout.trim()

      console.log(`Generation output (raw):\n${generated}`)
      return res.status(200).json({
        message: 'Text generation complete',
        output: generated,
      })
    } catch (parseError) {
      console.error('Error processing generation output:', parseError)
      return res.status(500).json({ error: 'Failed to process generation output' })
    }
  })
})

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
