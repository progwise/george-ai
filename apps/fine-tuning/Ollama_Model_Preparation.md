# Adapter Fusion and Format Conversion (Safetensors to `.gguf` for Ollama)

> **Abstract:**  
> This guide provides a step-by-step workflow for fine-tuning a Hugging Face LLM (such as Qwen) using MLX-LM on Apple Silicon, fusing LoRA adapter weights into the base model, and converting the resulting model to the `.gguf` format for use with Ollama and llama.cpp. It covers environment setup, dataset preparation, model fine-tuning, adapter fusion, GGUF conversion, and Ollama integration. While tailored for macOS and Apple Silicon, the general process applies to other supported platforms.

---

## Requirements

- Apple Silicon Mac running macOS
- [mlx-lm](https://github.com/ml-explore/mlx-lm)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- Python 3.9+ (use a virtual environment)

> **Note:** This guide uses the Qwen LLM as an example, but the process is similar for other Hugging Face models supported by MLX-LM.

---

## 1. Prerequisites

### 1.1. Setup Python Environment

Open a terminal in `george-ai/apps/fine-tuning` and run:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 1.2. Download and Test LLMs from Hugging Face

Test the model (example: Qwen 0.5B-Instruct):

```bash
python3 -m mlx_lm.generate --prompt "tell me a limerick about cheese" --model Qwen/Qwen2.5-Coder-0.5B-Instruct
```

### 1.3. Split the Dataset

Split your dataset into train/valid/test sets:

```bash
python3 split_dataset.py jsonl/george-ai/dataset.jsonl --train 0.8 --valid 0.1 --test 0.1 --output split_output
```

### 1.4. Fine-tune the Model

Fine-tune the model to produce LoRA adapter weights:

```bash
python3 fine_tune.py --model Qwen/Qwen2.5-Coder-0.5B-Instruct --data split_output
```

---

## 2. Fuse Adapter Weights

Fuse the learned adapters into the base model to create a merged Hugging Face directory.

**Recommended:** Use the provided `fuse.py` script, which infers paths automatically.

```bash
python3 fuse.py --base-model Qwen/Qwen2.5-Coder-0.5B-Instruct
```


---

## 3. Convert Safetensors to `.gguf`

To use your merged Hugging Face model with Ollama, convert it from the Hugging Face `safetensors` format to the `.gguf` format.
### 3.2. Verify Merged Model Directory

Ensure your merged model directory (e.g., `fused_model/qwen25_coder_05b_instruct_merged/`) contains:

```
config.json
generation_config.json
merges.txt
model.safetensors
model.safetensors.index.json
tokenizer.json
tokenizer_config.json
vocab.json
special_tokens_map.json
```

### 3.3. Convert to `.gguf` Format

Run the conversion:

```bash
model_name="qwen2.5_coder_0.5b_instruct"
outdir="./gguf_models/${model_name}"
outfile="${outdir}/${model_name}_fp16.gguf"

mkdir -p "$outdir"

python3 hf-to-gguf/convert_hf_to_gguf.py \
    ./fused_model/qwen25_coder_05b_instruct_merged \
    --outfile "$outfile"
```

- This generates a `.gguf` file in FP16 format, ready for use with Ollama.

---

## 4. Integrate with Ollama

### 4.1. Create a Modelfile

Create a `modelfile` corresponding to the `.gguf` file.
Execute the following script in the directory containing your `.gguf` file:

```bash
#!/bin/bash

# Get the absolute path of the current directory
current_dir=$(pwd)

# Find the .gguf file in the current directory
gguf_file=$(find "$current_dir" -maxdepth 1 -name "*.gguf")

# Check if a .gguf file exists
if [ -z "$gguf_file" ]; then
  echo "No .gguf file found in the current directory."
  exit 1
fi

# Write the absolute path of the .gguf file to the modelfile
cat <<EOF > modelfile
FROM $gguf_file
# Optional parameters for model configuration:
# PARAMETER temperature 0.7
# SYSTEM "You are an expert George-AI assistant."
EOF
```

### 4.2. Register the Model with Ollama

In the directory containing your new model folder, register the model with Ollama:

```bash
ollama create qwen2.5-coder-0.5b:george -f modelfile
```

### 4.3. Start an Interactive Chat

Launch an interactive chat session with your fine-tuned model:

```bash
ollama run qwen2.5-coder-0.5b:george
```

You can now interact with your fine-tuned Qwen model in Ollama.

