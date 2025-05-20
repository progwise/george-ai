# Adapter Fusion and Format Conversion (Safetensors to `.gguf` for Ollama)

> **Abstract:**  
> This guide provides a step-by-step workflow for fine-tuning a Hugging Face LLM (such as Qwen) using MLX-LM on Apple Silicon, fusing LoRA adapter weights into the base model, and converting the resulting model to the `.gguf` format for use with Ollama and llama.cpp. It covers environment setup, dataset preparation, model fine-tuning, adapter fusion, GGUF conversion, and Ollama integration. The instructions are tailored for macOS and Apple Silicon; however, the general process should be applicable to other supported platforms.

**Requirements:**  
- Apple Silicon Mac running macOS  
- [mlx-lm](https://github.com/ml-explore/mlx-lm)  
- [llama.cpp](https://github.com/ggml-org/llama.cpp)  
- Python 3.9+ (use a virtual environment)

**Note:** This guide uses the `Qwen` LLM as an example, but the process is similar for other Hugging Face models supported by MLX-LM.

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

### 1.2. Download & Test LLMs from Hugging Face

Download and test the model (example: Qwen 0.5B-Instruct):

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

- You can override the adapter or output path with `--adapter-path` and `--merged-model` if needed.
- The merged model will be saved in `./fused_model/<model_name>_merged`.

---

## 3. Convert Safetensors to `.gguf`

To use your merged Hugging Face model with Ollama, you need to convert it from the Hugging Face `safetensors` format to the `.gguf` format supported by `llama.cpp` and Ollama.

### 3.1. Clone and Set Up `llama.cpp`

First, clone the `llama.cpp` repository next to your `george-ai` repo for convenient relative paths:

```bash
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
python3 -m venv .venv
source .venv/bin/activate
```

### 3.2. Install Build Tools

You need `cmake` to build `llama.cpp`. Install it using either Homebrew or pip:

- **Homebrew:**
    ```bash
    brew install cmake curl
    echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
    ```

- **Or pip (inside your venv):**
    ```bash
    pip install --upgrade pip
    pip install cmake
    ```

### 3.3. Build `llama.cpp`

Compile the project:

```bash
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j8
```

### 3.4. Verify Merged Model Directory

Ensure your merged model directory (e.g., `fused_model/qwen25_coder_05b_instruct_merged/`) contains the following files:

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

### 3.5. Convert to `.gguf` Format

From inside the `llama.cpp` directory, install the required Python packages and run the conversion script:

```bash
pip install transformers torch sentencepiece
mkdir -p ../george-ai/apps/fine-tuning/gguf_models
python3 convert_hf_to_gguf.py \
    ../george-ai/apps/fine-tuning/fused_model/qwen25_coder_05b_instruct_merged \
    --outfile ../george-ai/apps/fine-tuning/gguf_models/qwen2.5_coder_0.5b_instruct_fp16.gguf
```

From inside `george-ai`:

```bash
pip install transformers torch sentencepiece
python3 hf-to-gguf/convert_hf_to_gguf.py \
    ./fused_model/qwen25_coder_05b_instruct_merged \
    --outfile ./gguf_models/qwen2.5_coder_0.5b_instruct_fp16.gguf
```

- This will generate a `.gguf` file in FP16 format, ready for use with Ollama.

---

## 4. Integrate with Ollama

### 4.1. Create a Modelfile

Now, back to `George-AI`, we should create a `Modelfile` corresponding to the gguf file we created in the previous step. Replace `qwen2.5_coder_0.5b_instruct_fp16.gguf` with your actual `.gguf` filename (without the `.gguf` extension):

```bash
MODEL_NAME="qwen2.5_coder_0.5b_instruct_fp16" #change accordingly
mkdir -p "$MODEL_NAME"
mv "$MODEL_NAME.gguf" "$MODEL_NAME/"
cat <<EOF > "$MODEL_NAME/Modelfile"
FROM $(pwd)/$MODEL_NAME/$MODEL_NAME.gguf
# Optional parameters for model configuration:
# PARAMETER temperature 0.7
# SYSTEM "You are an expert George-AI assistant."
```

### 4.2. Register the Model with Ollama

Make sure you're in the directory containing your new model folder (e.g., `qwen2.5_coder_0.5b_instruct_fp16`). Then, register the model with Ollama using the `Modelfile` you just created. Replace `qwen2.5_coder_0.5b_instruct_fp16` with your actual model name if different:

```bash
ollama create qwen2.5-coder-0.5b:george -f Modelfile
```

### 4.3. Start an Interactive Chat

Now you can launch an interactive chat session with your fine-tuned model:

```bash
ollama run qwen2.5-coder-0.5b:george
```

You can now interact with your fine-tuned Qwen model in Ollama.

---

## Troubleshooting & Tips

- If you get errors about missing files, double-check your merged model directory structure.
- For other models, adjust the model names and paths accordingly.
- Always activate your Python virtual environment before running Python commands.
- For more details on GGUF conversion, see the [llama.cpp documentation](https://github.com/ggml-org/llama.cpp).

---
