const express = require('express')
const { exec } = require('child_process')
const app = express()
app.use(express.json())

const PORT = 3000

// --- Fine-tune endpoint ---
app.post('/fine-tune', async (req, res) => {
  const { model, learningRate, iters, fineTuneType, dataPath, numLayers, huggingFaceToken } = req.body

  if (!model || !dataPath || !huggingFaceToken) {
    return res.status(400).json({ error: 'Missing required fields: model, dataPath, huggingFaceToken' })
  }

  const validFineTuneTypes = ['lora', 'full']
  if (!validFineTuneTypes.includes(fineTuneType)) {
    return res
      .status(400)
      .json({ error: `Invalid fineTuneType. Must be one of: ${validFineTuneTypes.join(', ')}` })
  }

  process.env.HF_TOKEN = huggingFaceToken

  const cmd = `python3 -m mlx_lm lora \
    --model "${model}" \
    --train \
    --data "${dataPath}" \
    --num-layers ${numLayers || 4} \
    --learning-rate ${learningRate || 1e-5} \
    --iters ${iters || 100} \
    --fine-tune-type ${fineTuneType}`

  console.log(`🚀 Running fine-tune:\n${cmd}`)

  exec(cmd, { env: process.env }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Fine-tuning error:\n${stderr}`)
      return res.status(500).json({ error: stderr })
    }
    return res.status(200).json({
      message: 'Fine-tuning complete',
      fineTuneType,
      model,
      output: stdout.trim(),
    })
  })
})

// --- Generate endpoint with robust splitting ---
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

    // 1. split on any line that is 10+ "=" characters
    // 2. filter out empty strings
    const rawParts = stdout.split(/(?:^|\r?\n)={10,}(?:\r?\n|$)/)
    const parts = rawParts.filter(p => p.trim().length > 0)

    // 3. the first non-empty part is the actual generated text
    const generated = parts.length > 0 ? parts[0].trim() : stdout.trim()

    console.log(`Generation output (raw):\n${generated}`)
    return res.status(200).json({
      message: 'Text generation complete',
      output: generated,
    })
  })
})

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
