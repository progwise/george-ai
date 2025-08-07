"""
Run LoRA fine-tuning using mlx_lm.lora with automatic chat template formatting.

This script automatically applies the correct chat template based on the model you're fine-tuning.
It converts raw prompt/completion data to the proper chat format that matches the model's training format,
ensuring optimal performance during fine-tuning.

FEATURES:
- Automatic chat template detection and application based on model
- Supports multiple data formats (prompt/completion, pre-formatted chat)
- Preserves metadata from original dataset
- Temporary processing with automatic cleanup

USAGE EXAMPLES:

  python3 fine_tune.py --model Qwen/Qwen2.5-Coder-0.5B-Instruct --data ./jsonl/raw
    # Fine-tunes Qwen model using raw prompt/completion data
    # Automatically applies Qwen's chat template format
    # Adapter saved as: adapters_Qwen25Coder05BInstruct

  python3 fine_tune.py --model mistralai/Mistral-7B-Instruct-v0.1 --data ./jsonl/raw
    # Fine-tunes Mistral model with Mistral's chat template format
    # Adapter saved as: adapters_Mistral7BInstructv01

  python3 fine_tune.py --model microsoft/DialoGPT-medium --data ./split_output --adapter-dir ./my_adapters
    # Custom adapter directory location

Arguments:
  --model       Name of the base model (e.g., Qwen/Qwen2.5-Coder-0.5B-Instruct)
  --data        Path to the dataset folder containing .jsonl files
  --adapter-dir Directory to store adapter weights (default: current directory)

Supported Data Formats:
  1. Raw prompt/completion: {"prompt": "question", "completion": "answer", ...}
  2. Pre-formatted chat: {"text": "<|im_start|>user\n...", ...}
  3. Mixed formats are handled automatically
"""

import argparse
import sys
import os
import json
import tempfile
import shutil
from pathlib import Path
import mlx_lm.lora
from transformers import AutoTokenizer


def convert_to_chat_format(data_folder: str, model_name: str) -> str:
    """
    Convert raw prompt/completion data to chat template format for the specified model.

    Args:
        data_folder: Path to the original dataset folder
        model_name: Name of the model (to get appropriate tokenizer/chat template)

    Returns:
        Path to the processed dataset folder with chat-formatted data
    """
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    temp_dir = tempfile.mkdtemp(prefix="chat_formatted_")
    processed_folder = Path(temp_dir)


    data_path = Path(data_folder)
    for file_path in data_path.rglob("*.jsonl"):
        # Create corresponding output directory structure
        relative_path = file_path.relative_to(data_path)
        output_file = processed_folder / relative_path
        output_file.parent.mkdir(parents=True, exist_ok=True)

        # Process the JSONL file
        with open(file_path, 'r', encoding='utf-8') as input_file, \
                open(output_file, 'w', encoding='utf-8') as output_file_handle:

            for line in input_file:
                data = json.loads(line.strip())

                # Check if data is already in chat format (has 'text' field with chat template)
                if 'text' in data and ('<start_of_turn>' in data['text'] or
                                       '<|im_start|>' in data['text'] or
                                       '[INST]' in data['text']):
                    # Already formatted, just copy
                    output_file_handle.write(line)
                    continue

                # Convert prompt/completion format to chat format
                if 'prompt' in data and 'completion' in data:
                    # Create messages for chat template
                    messages = [
                        {"role": "user", "content": data['prompt']},
                        {"role": "assistant", "content": data['completion']}
                    ]

                    # Apply chat template
                    try:
                        formatted_text = tokenizer.apply_chat_template(
                            messages,
                            tokenize=False,
                            add_generation_prompt=False
                        )

                        # Create new data entry with formatted text
                        new_data = {
                            "text": formatted_text,
                            **{k: v for k, v in data.items() if k not in ['prompt', 'completion']}
                        }

                        output_file_handle.write(json.dumps(
                            new_data, ensure_ascii=False) + '\n')

                    except Exception as e:
                        print(
                            f"Warning: Failed to apply chat template for line in {file_path}: {e}")
                        print(f"Using fallback format for this entry")

                        # Fallback: create a simple chat format
                        fallback_text = f"User: {data['prompt']}\n\nAssistant: {data['completion']}"
                        new_data = {
                            "text": fallback_text,
                            **{k: v for k, v in data.items() if k not in ['prompt', 'completion']}
                        }
                        output_file_handle.write(json.dumps(
                            new_data, ensure_ascii=False) + '\n')

                else:
                    # Unknown format, copy as-is
                    output_file_handle.write(line)

    # Copy any non-JSONL files (like README, etc.)
    for file_path in data_path.rglob("*"):
        if file_path.is_file() and not file_path.suffix == '.jsonl':
            relative_path = file_path.relative_to(data_path)
            output_file = processed_folder / relative_path
            output_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, output_file)

    return str(processed_folder)


def run_finetune(model_name: str, data_folder: str, adapter_dir: str = "."):
    adapter_path = f"{adapter_dir}/adapters_{model_name.split('/')[-1].replace('.', '').replace('-', '_')}"

    print(f"Preprocessing data with chat template for model: {model_name}")

    # Convert data to appropriate chat format for the model
    processed_data_folder = convert_to_chat_format(data_folder, model_name)

    print(f"Data preprocessed and saved to: {processed_data_folder}")
    print(f"🚀 Starting LoRA fine-tuning...")

    sys.argv = [
        "lora",
        "--model", model_name,
        "--train",
        "--data", processed_data_folder,
        "--num-layers", "4",
        "--learning-rate", "1e-5",
        "--iters", "100",
        "--fine-tune-type", "lora",
        "--adapter-path", adapter_path
    ]

    try:
        mlx_lm.lora.main()
        print(f"Fine-tuning completed! Adapter saved to: {adapter_path}")
    finally:
        # Clean up temporary directory
        if os.path.exists(processed_data_folder):
            print(
                f"🧹 Cleaning up temporary data folder: {processed_data_folder}")
            shutil.rmtree(processed_data_folder)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Run LoRA fine-tuning using mlx_lm.lora")
    parser.add_argument("--model", required=True,
                        help="Model name, e.g., Qwen/Qwen2.5-Coder-0.5B-Instruct")
    parser.add_argument("--data", required=True,
                        help="Path to the dataset folder")
    parser.add_argument("--adapter-dir", default=".",
                        help="Directory to store adapter weights (default: current directory)")

    args = parser.parse_args()
    run_finetune(args.model, args.data, args.adapter_dir)