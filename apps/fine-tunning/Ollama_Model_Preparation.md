# Adapter fusion and format conversion from safetensors to `.gguf` to be imported to Ollama

**Note**: This guide is using the `Qwen` LLM.

**Requirements**: You need an Apple Scilicon machine running MacOS to walkthrough this guide.

## Step 1 - Weight fusion

In order to fused the learned adapters to the base model use the following script:


```bash
import os
import subprocess
import sys

BASE_MODEL = "Qwen/Qwen2.5-Coder-0.5B-Instruct"
ADAPTER_PATH = "./adapters_Qwen25_Coder_05B_Instruct"
MERGED_MODEL = "./fused_model/qwen25_coder_05b_instruct_merged"
"


def run_command(cmd, cwd=None):
    try:
        print("▶️", " ".join(cmd))
        subprocess.run(cmd, check=True, cwd=cwd)
    except subprocess.CalledProcessError:
        print(f"✖️ Error running: {' '.join(cmd)}")
        sys.exit(1)


def fuse_adapter():
    print("🔗 Fusing LoRA adapter into base model…")
    run_command([
        "python3", "-m", "mlx_lm.fuse",
        "--model", BASE_MODEL,
        "--adapter-path", ADAPTER_PATH,
        "--save-path", MERGED_MODEL
    ])
    print("Adapter fused.")

```

## Step 2 - Conversion from the safetensors format to `.gguf`

To do this steo first you need to install `cmake` on your machine:

You can use this command to install `cmake` using homebrew on MacOS:

```bash
brew install cmake curl
```

Make sure Homebrew’s bin is in your PATH. On Apple Silicon:

```bash
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```
Afrer, installing `cmake` , you should Clone & Build `llama.cpp` as a different repository in a different directory.

```bash
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
```

### Generate CMake build files
```bash
cmake -B build -DCMAKE_BUILD_TYPE=Release
```

### Compile everything (including the Python converter)
```bash
cmake --build build --config Release -j8
```

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


## Convert Safetensors → FP16 GGUF
From inside `llama.cpp/`, run:

```bash
python3 convert_hf_to_gguf.py \
  /absolute/path/to/qwen25_coder_05b_instruct_merged \
  --outfile /absolute/path/to/qwen25_coder_05b_instruct_merged/qwen2.5_coder_0.5b_instruct_fp16.gguf
```

**What happens**

* Loads your HF config, tokenizer, and safetensors weights

* Writes out a single `*.gguf` file in `FP16`



## Step 3 - Integration with Ollama

### 3.1 Create a Modelfile

Create a new file named `Modelfile` (no extension) in the same directory as your GGUF file. Add the following content:

```text
FROM /absolute/path/to/qwen2.5_coder_0.5b_instruct_fp16.gguf
```

You can optionally add parameters to customize the model's behavior:

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

### 3.3 Launch an Interactive Chat

Start an interactive chat session with your custom Qwen model:

```bash
ollama run qwen2.5-coder-0.5b:instruct
```

Now, you can interact with your custom Qwen model.

