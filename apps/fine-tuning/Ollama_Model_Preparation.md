# Adapter Fusion and Format Conversion (Safetensors to `.gguf` for Ollama)

**Requirements:** An Apple Silicon Mac running macOS.

**Note:** This guide uses the `Qwen` LLM.


## Prerequisites

First you need to do the fine-tuning in order to have the adapter weights.

Outside dev containers in a bash terminal execute the following in this current directory inside the `george-ai` repo i. e.: `george-ai/apps/fine-tuning"


```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m pip install --upgrade pip
```



### Downlaod & Test LLMs from Hugging Face (if you already have not done)

Downlaod the model from Hugging Face and create chat utilities and test it.

**Qwen 0.5B-Instruct:**

```bash
python3 -m mlx_lm.generate --prompt "tell me a limerick about cheese" --model Qwen/Qwen2.5-Coder-0.5B-Instruct
```

### Split the dataset

Split the dataset into training, validation, and test sets based on specified ratios.

```bash
python3 split_dataset.py jsonl/george-ai/dataset.jsonl --train 0.8 --valid 0.1 --test 0.1 --output split_output
```

### Fine tuning

Perfrom the Fine tuning to prepare the adapter weights.

```bash
python3 fine_tune.py --model Qwen/Qwen2.5-Coder-0.5B-Instruct --data split_output
```



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

you can simply run by using the following command:

```bash
python3 fuse.py
```

---

## Step 2 – Convert Safetensors to `.gguf`

For this step we need to clone another repository `https://github.com/ggml-org/llama.cpp.git`.
For simplicity with the relative paths in this guide clone it next the `george-ai` repo.

To do the conversion from `.safetensors` format to `.gguf` we to install `cmake`.

To do this you can install `cmake` on your machine using homebrew or install it in your pip virtual environment (recommended).

### 2.1 Install `cmake` using homebrew

Install `cmake` and `curl` using Homebrew:

```bash
brew install cmake curl
```

Ensure Homebrew’s bin is in your `PATH` (Apple Silicon):

```bash
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Or you can install `cmake` using pip

### 2.2 Clone & Build `llama.cpp`

```bash
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp

python3 -m venv .venv
source .venv/bin/activate

pip install cmake
python3 -m pip install --upgrade pip


cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j8
```
### 2.3 Prepare Model Directory

In `George-AI` repo in `/apps/fine-tuning` make sure that Your Model Folder looks like:

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
  --outfile /absolute/path/to/fine-tuning/gguf_models/qwen2.5_coder_0.5b_instruct_fp16.gguf
```

or if you have cloned the llama.cpp next to the george-ai you can use the following:

```bash
mkdir ../george-ai/apps/fine-tuning/gguf_models
pip install transformers torch sentencepiece
python3 convert_hf_to_gguf.py \
  ../george-ai/apps/fine-tuning/fused_model/qwen25_coder_05b_instruct_merged \
  --outfile ../george-ai/apps/fine-tuning/gguf_models/qwen2.5_coder_0.5b_instruct_fp16.gguf 
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
SYSTEM "You are an expert George-AI Qwen assistant."
```

### 3.2 Register the Model

Register your model with Ollama using the following command:

```bash
ollama create qwen2.5-coder-0.5b:george -f Modelfile
```

### 3.3 Start an Interactive Chat

Launch a chat session:

```bash
ollama run qwen2.5-coder-0.5b:george
```

You can now interact with your fine-tuned Qwen model.
