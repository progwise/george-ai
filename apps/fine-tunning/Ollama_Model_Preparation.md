# Adapter Fusion and Format Conversion (Safetensors to `.gguf` for Ollama)

**Note:** This guide uses the `Qwen` LLM.

**Requirements:** An Apple Silicon Mac running macOS.

---

## Step 1 – Fuse Adapter Weights

To fuse the learned adapters into the base model, use the following script, making sure that paths are correct.

```python
import os
import subprocess
import sys

BASE_MODEL = "Qwen/Qwen2.5-Coder-0.5B-Instruct"
ADAPTER_PATH = "./adapters_Qwen25_Coder_05B_Instruct"
MERGED_MODEL = "./fused_model/qwen25_coder_05b_instruct_merged"

def run_command(cmd, cwd=None):
    try:
        print(">", " ".join(cmd))
            subprocess.run(cmd, check=True, cwd=cwd)
    except subprocess.CalledProcessError:
        print(f"Error running: {' '.join(cmd)}")
            sys.exit(1)

        def fuse_adapter():
            print("Fusing LoRA adapter into base model...")   run_command([
        "python3", "-m", "mlx_lm.fuse",
        "--model", BASE_MODEL,
        "--adapter-path", ADAPTER_PATH,
        "--save-path", MERGED_MODEL
    ])
    print("Adapter fused.")

if __name__ == "__main__":
    fuse_adapter()
```

---

## Step 2 – Convert Safetensors to `.gguf`

### 2.1 Install Prerequisites

Install `cmake` and `curl` using Homebrew:

```bash
brew install cmake curl
```

Ensure Homebrew’s bin is in your `PATH` (Apple Silicon):

```bash
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 2.2 Clone & Build `llama.cpp`

```bash
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j8
```
### 2.3 Prepare Model Directory

In `George-AI` repo in `/apps/fine-tunning` make sure that Your Model Folder looks like:

```pgsql
qwen25_coder_05b_instruct_merged/
├─ config.json
├─ generation_config.json
├─ merges.txt
├─ model.safetensors
├─ model.safetensors.index.json
├─ tokenizer.json
├─ tokenizer_config.json
├─ vocab.json
└─ special_tokens_map.json
```
This is exactly the structure the converter expects.

### 2.4 Convert to GGUF

From inside the `llama.cpp/`  repo, run:

```bash
python3 convert_hf_to_gguf.py \
  /absolute/path/to/qwen25_coder_05b_instruct_merged \
  --outfile /absolute/path/to/qwen25_coder_05b_instruct_merged/qwen2.5_coder_0.5b_instruct_fp16.gguf
```

This loads your Hugging Face config, tokenizer, and safetensors weights, and writes a single `.gguf` file in FP16.

---

## Step 3 – Integrate with Ollama

### 3.1 Create a Modelfile

In the same directory as your `.gguf` file, create a file named `Modelfile` (no extension):

```text
FROM /absolute/path/to/qwen2.5_coder_0.5b_instruct_fp16.gguf
```

Optionally, add parameters:

```text
FROM /absolute/path/to/qwen2.5_coder_0.5b_instruct_fp16.gguf
PARAMETER temperature 0.7
PARAMETER max_tokens 512
SYSTEM "You are an expert Qwen assistant."
```

### 3.2 Register the Model

Register your model with Ollama using the following command:

```bash
ollama create qwen2.5-coder-0.5b:instruct -f Modelfile
```

### 3.3 Start an Interactive Chat

Launch a chat session:

```bash
ollama run qwen2.5-coder-0.5b:instruct
```

You can now interact with your fine-tuned Qwen model.
