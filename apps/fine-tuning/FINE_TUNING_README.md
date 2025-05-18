# Fine Tuning with Hugging Face and MLX-LM

## Create a pip virtual environment and activate it:

```bash
python3 -m venv venv
source venv/bin/activate
```

## Instal Dependencies

```bash
python3 -m pip install --upgrade pip
python3 -m pip install mlx-lm datasets
```

## Downlaod & Test LLMs from Hugging Face

downlaod model from Hugging Face and create chat utilities and test it.

**Qwen 0.5B-Instruct:**

```bash
python3 -m mlx_lm.generate --prompt "tell me a limerick about cheese" --model Qwen/Qwen2.5-Coder-0.5B-Instruct
```

**Qwen 7B-Instruct:**

```bash
python3 -m mlx_lm.generate --prompt "tell me a limerick about cheese" --model Qwen/Qwen2.5-Coder-7B-Instruct
```

## Fine tuning new

```bash
python3 fine_tune.py --model Qwen/Qwen2.5-Coder-7B-Instruct --data split_output
```

## Prompting new

```bash
python3 prompt.py --model Qwen/Qwen2.5-Coder-0.5B-Instruct --prompt "Can I create custom dashboards in George-AI?"
```

---

# OLD:

## Fine tuning (full/lora)

- In case you want full finetuning change `lora` to `full` in the `fine-tune-type` at the end of the script below:

**Qwen 0.5B-Instruct:**

```bash
python3 -m mlx_lm.lora \
    --model "Qwen/Qwen2.5-Coder-0.5B-Instruct" \
    --train \
    --data "./jsonl/george-ai" \
    --num-layers 4 \
    --learning-rate 1e-5 \
    --iters 100 \
    --fine-tune-type lora
```

**Qwen 7B-Instruct:**

```bash
python3 -m mlx_lm.lora \
    --model "Qwen/Qwen2.5-Coder-7B-Instruct" \
    --train \
    --data "./jsonl/george-ai" \
    --num-layers 4 \
    --learning-rate 1e-5 \
    --iters 100 \
    --fine-tune-type lora
```

## Testing the Adapters

Change the model name accordingly:

- Qwen2.5-Coder-0.5B-Instruct:

```bash
python3 -m mlx_lm.generate \
  --model "Qwen/Qwen2.5-Coder-0.5B-Instruct" \
  --prompt "How do I use George AI to answer questions?" \
  --adapter-path adapters \
  --max-tokens 150
```

- Qwen2.5-Coder-7B-Instruct:

```bash
python3 -m mlx_lm.generate \
  --model "Qwen/Qwen2.5-Coder-7B-Instruct" \
  --prompt "How do I use George AI to answer questions?" \
  --adapter-path adapters \
  --max-tokens 150
```

## More models?

You can find more applicable models through the link below:

https://huggingface.co/mlx-community
