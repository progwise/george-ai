# MLX Fine-Tuning and Inference API

This project provides a RESTful API to fine-tune Hugging Face-supported LLMs using [mlx-lm](https://pypi.org/project/mlx-lm/) and then generate text using the fine-tuned models.

## Features

- Fine-tune LLMs with LoRA or full fine-tuning
- Submit training parameters and Hugging Face token via API
- Automatically saves trained adapters
- Generate text using base or fine-tuned models

---

## Setup

1. **Install Express:**

```bash
npm install -g pnpm
pnpm i
```

2. **Create pip venv**

```bash
python3 -m venv venv
source venv/bin/activate
```

3. **Install Python dependencies**

```bash
pip install mlx-lm datasets
```

> Ensure you are using Python 3.9+ and a virtual environment is recommended.

---

## Running the Server

```bash
node server.js
```

You’ll see:

```
API server running at http://localhost:4567
```

---

## API Endpoints

### `POST /fine-tune`

Fine-tunes a model using the specified dataset and parameters.

**Body Parameters:**

| Field              | Type    | Required | Description                                     |
| ------------------ | ------- | -------- | ----------------------------------------------- |
| `model`            | string  | Yes      | Hugging Face model ID (e.g. `Qwen/...`)         |
| `learningRate`     | float   | No       | Defaults to `1e-5`                              |
| `iters`            | integer | No       | Number of iterations (default: `100`)           |
| `fineTuneType`     | string  | Yes      | `"lora"` or `"full"`                            |
| `dataPath`         | string  | Yes      | Path to dataset directory with train & val JSON |
| `numLayers`        | integer | No       | Defaults to `4`                                 |
| `huggingFaceToken` | string  | Yes      | HF access token to download the model           |

# Examples

**Run the Bare Model**


### Qwen 0.5B

```bash
curl -X POST http://localhost:4567/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-Coder-0.5B-Instruct",
    "prompt": "Explain the theory of relativity in simple terms.",
    "maxTokens": 200
}'
```

### Qwen 7B

```bash
curl -X POST http://localhost:4567/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-Coder-7B-Instruct",
    "prompt": "Explain the theory of relativity in simple terms.",
    "maxTokens": 200
}'
```

**Training the model:**

### Qwen 0.5B

```bash
curl -X POST http://localhost:4567/fine-tune \
-H "Content-Type: application/json" \
-d '{
  "model": "Qwen/Qwen2.5-Coder-0.5B-Instruct",
  "learningRate": 1e-5,
  "iters": 100,
  "fineTuneType": "lora",
  "dataPath": "./jsonl/george-ai",
  "numLayers": 4,
  "huggingFaceToken": "your_hf_token_here"
}'
```

### Qwen 7B

```bash
curl -X POST http://localhost:4567/fine-tune \
-H "Content-Type: application/json" \
-d '{
  "model": "Qwen/Qwen2.5-Coder-7B-Instruct",
  "learningRate": 1e-5,
  "iters": 100,
  "fineTuneType": "lora",
  "dataPath": "./jsonl/george-ai",
  "numLayers": 4,
  "huggingFaceToken": "your_hf_token_here"
}'
```

---

### `POST /generate`

Generates text using a model and (optionally) fine-tuned adapters.

**Body Parameters:**

| Field         | Type    | Required | Description                             |
| ------------- | ------- | -------- | --------------------------------------- |
| `model`       | string  | Yes      | Same model ID used during fine-tune     |
| `prompt`      | string  | Yes      | The prompt to send to the model         |
| `adapterPath` | string  | No       | Path to LoRA adapter (e.g., `adapters`) |
| `maxTokens`   | integer | No       | Defaults to `300`                       |

**Example:**

```bash
curl -X POST http://localhost:4567/generate \
-H "Content-Type: application/json" \
-d '{
  "model": "Qwen/Qwen2.5-Coder-0.5B-Instruct",
  "prompt": "What is 9 + 3?",
  "adapterPath": "adapters",
  "maxTokens": 100
}'
```

```bash
curl -X POST http://localhost:4567/generate \
-H "Content-Type: application/json" \
-d '{
  "model": "Qwen/Qwen2.5-Coder-0.5B-Instruct",
  "prompt": "Where is the capital of the US?",
  "adapterPath": "adapters",
  "maxTokens": 100
}'
```

## George Case

### Qwen 0.5B

#### Train:

```bash
curl -X POST http://localhost:4567/fine-tune   -H "Content-Type: application/json"   -d '{
    "model": "Qwen/Qwen2.5-Coder-0.5B-Instruct",
    "learningRate": 1e-5,
    "iters": 100,
    "fineTuneType": "lora",
    "dataPath": "./jsonl/george-ai",
    "huggingFaceToken": "your_hf_token_here"
}'
```

#### Query:

```bash
curl -X POST http://localhost:4567/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-Coder-0.5B-Instruct",
    "prompt": "How do I use George AI to answer questions?",
    "adapterPath": "adapters",
    "maxTokens": 150
}'
```

### Qwen 7B

#### Train:

```bash
curl -X POST http://localhost:4567/fine-tune   -H "Content-Type: application/json"   -d '{
    "model": "Qwen/Qwen2.5-Coder-7B-Instruct",
    "learningRate": 1e-5,
    "iters": 100,
    "fineTuneType": "lora",
    "dataPath": "./jsonl/george-ai",
    "huggingFaceToken": "your_hf_token_here"
}'
```

#### Query:

```bash
curl -X POST http://localhost:4567/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-Coder-7B-Instruct",
    "prompt": "How do I use George AI to answer questions?",
    "adapterPath": "adapters",
    "maxTokens": 150
}'
```
