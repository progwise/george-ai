## Create a pip virtual environment and activate it:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

import the llama.cpp module:

```bash
chmod +x install.sh
source install.sh
```

execute the script `auto_finetune_to_ollama.py`:

```bash
python3 auto_finetune_to_ollama.py <NAME_OF_YOUR_CONFIG_FILE>.json
```

for example:

```json
{
  "base_model": "Qwen/Qwen2.5-Coder-7B-Instruct",
  "dataset_path": "jsonl/raw/qa-data.jsonl",
  "train_ratio": 0.8,
  "valid_ratio": 0.1,
  "test_ratio": 0.1,
  "fine_tune_params": {
    "num_layers": 4,
    "learning_rate": 1e-5,
    "iters": 100,
    "fine_tune_type": "lora"
  },
  "ollama_model_name": "qwen2.5-coder-7b-verlag",
  "keep_split_data": true,
  "keep_fused_model": true,
  "keep_gguf_files": true,
  "keep_adapter_weights": true
}
```

**Explanation of JSON variables:**

- `base_model`: The name or path of the base model to fine-tune.
- `dataset_path`: Path to your training dataset in JSONL format.
- `train_ratio`: Fraction of data used for training (e.g., 0.8 = 80%).
- `valid_ratio`: Fraction of data used for validation (e.g., 0.1 = 10%).
- `test_ratio`: Fraction of data used for testing (e.g., 0.1 = 10%).
- `fine_tune_params`: Parameters for the fine-tuning process:
    - `num_layers`: Number of layers to fine-tune.
    - `learning_rate`: Learning rate for the optimizer.
    - `iters`: Number of training iterations.
    - `fine_tune_type`: Type of fine-tuning (e.g., "lora").
- `ollama_model_name`: Name to assign to the resulting Ollama model.
- `keep_split_data`: If true, keep the split train/valid/test data files.
- `keep_fused_model`: If true, keep the fused model file after fine-tuning.
- `keep_gguf_files`: If true, keep GGUF format files after conversion.
- `keep_adapter_weights`: If true, keep the adapter weights after training.


To run the fine-tuned model with Ollama:

```bash
        ollama run <ollama_model_name>
```