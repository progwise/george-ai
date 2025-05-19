"""
Automate the workflow: fine-tune a Hugging Face model with MLX-LM, fuse LoRA adapter, convert to GGUF, and prepare for Ollama.

USAGE:
  python3 automate_finetune_to_ollama.py --config config.json --project-name my_project

This script will:
  - Split your dataset for training/validation/testing.
  - Fine-tune the specified base model using MLX-LM and save adapters.
  - Fuse the LoRA adapter into the base model.
  - Convert the merged model to GGUF format for Ollama/llama.cpp.
  - Prepare an Ollama Modelfile and register the model with Ollama.

Arguments:
  --config        Path to a JSON config file (see example below).
  --project-name  Name of the output directory for this run (all outputs will be stored here).

If any required information is missing from the config or command line, you will be prompted interactively.

CONFIG FILE FORMAT (JSON):
{
  "base_model": "Qwen/Qwen2.5-Coder-0.5B-Instruct",
  "dataset_path": "jsonl/george-ai/dataset.jsonl",
  "train_ratio": 0.8,
  "valid_ratio": 0.1,
  "test_ratio": 0.1,
  "fine_tune_params": {
    "num_layers": 4,
    "learning_rate": 1e-5,
    "iters": 100,
    "fine_tune_type": "lora"
  },
  "ollama_model_name": "qwen2.5-coder-0.5b:george"
}

Outputs:
  All intermediate and final files (split data, adapters, fused model, GGUF, Modelfile) are stored in the project directory you specify.

Example:
  python3 automate_finetune_to_ollama.py --config finetune_ollama_config.json --project-name my_finetune_run
"""

import argparse
import json
import os
import subprocess
import sys


def run(cmd, cwd=None, env=None):
    print(">", " ".join(cmd))
    result = subprocess.run(cmd, cwd=cwd, env=env)
    if result.returncode != 0:
        print(f"Error running: {' '.join(cmd)}")
        sys.exit(1)


def ensure_path_exists(path, is_dir=False, create=False):
    if is_dir:
        if not os.path.isdir(path):
            if create:
                os.makedirs(path, exist_ok=True)
            else:
                print(f"ERROR: Directory does not exist: {path}")
                sys.exit(1)
    else:
        if not os.path.exists(path):
            if create:
                os.makedirs(path, exist_ok=True)
            else:
                print(f"ERROR: File or directory does not exist: {path}")
                sys.exit(1)


def prompt_if_missing(value, prompt_text, default=None):
    if value:
        return value
    if default is not None:
        inp = input(f"{prompt_text} [{default}]: ").strip()
        return inp if inp else default
    else:
        inp = ""
        while not inp:
            inp = input(f"{prompt_text}: ").strip()
        return inp


def print_check(stage):
    print(f"\033[92m[OK]\033[0m {stage}")


def main():
    parser = argparse.ArgumentParser(
        description="Automate MLX-LM fine-tune, fuse, GGUF conversion, and Ollama prep.")
    parser.add_argument("--config", required=True,
                        help="Path to JSON config file.")
    parser.add_argument(
        "--project-name", help="Project name or output folder for this fine-tuning run.")
    args = parser.parse_args()

    with open(args.config) as f:
        cfg = json.load(f)

    # Interactive prompts for missing info
    project_name = args.project_name or cfg.get("project_name")
    project_name = prompt_if_missing(
        project_name, "Enter a project name (output folder)")
    project_dir = os.path.abspath(project_name)
    os.makedirs(project_dir, exist_ok=True)

    base_model = cfg.get("base_model")
    base_model = prompt_if_missing(
        base_model, "Enter base model (e.g. Qwen/Qwen2.5-Coder-0.5B-Instruct)")

    dataset_path = cfg.get("dataset_path")
    dataset_path = prompt_if_missing(
        dataset_path, "Enter dataset path (e.g. jsonl/george-ai/dataset.jsonl)")

    split_output = os.path.join(project_dir, "split_output")
    adapters_dir = os.path.join(project_dir, "adapters")
    fused_model_dir = os.path.join(project_dir, "fused_model")
    gguf_dir = os.path.join(project_dir, "gguf_models")

    ollama_model_name = cfg.get("ollama_model_name")
    ollama_model_name = prompt_if_missing(
        ollama_model_name,
        "Enter Ollama model name (e.g. qwen2.5-coder-0.5b:george)",
        default=project_name.replace("/", "_")
    )

    train_ratio = cfg.get("train_ratio", 0.8)
    valid_ratio = cfg.get("valid_ratio", 0.1)
    test_ratio = cfg.get("test_ratio", 0.1)
    fine_tune_params = cfg.get("fine_tune_params", {})

    # Ensure dataset exists
    ensure_path_exists(dataset_path)

    # 1. Split dataset
    run([
        "python3", "split_dataset.py", dataset_path,
        "--train", str(train_ratio),
        "--valid", str(valid_ratio),
        "--test", str(test_ratio),
        "--output", split_output
    ])
    print_check("Dataset split")
    ensure_path_exists(split_output, is_dir=True, create=True)

    # 2. Fine-tune
    adapter_name = base_model.split("/")[-1].replace(".", "").replace("-", "_")
    adapter_path = os.path.join(adapters_dir, f"adapters_{adapter_name}")
    os.makedirs(adapters_dir, exist_ok=True)
    # fine_tune.py should be updated to accept --adapter-path
    fine_tune_cmd = [
        "python3", "fine_tune.py",
        "--model", base_model,
        "--data", split_output,
        "--adapter-path", adapter_path
    ]
    run(fine_tune_cmd)
    print_check("Fine-tuning complete")
    ensure_path_exists(adapter_path, is_dir=True)

    # 3. Fuse adapter
    os.makedirs(fused_model_dir, exist_ok=True)
    merged_model_name = f"{adapter_name.lower()}_merged"
    merged_model_path = os.path.join(fused_model_dir, merged_model_name)
    fuse_cmd = [
        "python3", "fuse.py",
        "--base-model", base_model,
        "--adapter-path", adapter_path,
        "--merged-model", merged_model_path
    ]
    run(fuse_cmd)
    print_check("Adapter fused into base model")

    # 4. Convert to GGUF
    os.makedirs(gguf_dir, exist_ok=True)
    gguf_file_name = f"{adapter_name.lower()}_fp16.gguf"
    gguf_outfile = os.path.join(gguf_dir, gguf_file_name)
    run([
        "python3", "convert_hf_to_gguf.py",
        merged_model_path,
        "--outfile", gguf_outfile
    ], cwd="../llama.cpp")
    print_check("Converted to GGUF")

    # 5. Prepare Ollama Modelfile and folder
    model_folder = os.path.join(project_dir, "ollama_model")
    os.makedirs(model_folder, exist_ok=True)
    gguf_basename = os.path.basename(gguf_outfile)
    target_gguf_path = os.path.join(model_folder, gguf_basename)
    if not os.path.exists(target_gguf_path):
        os.rename(gguf_outfile, target_gguf_path)
    modelfile_path = os.path.join(model_folder, "Modelfile")
    with open(modelfile_path, "w") as f:
        f.write(f"FROM {target_gguf_path}\n")
        f.write("# PARAMETER temperature 0.7\n")
        f.write('# SYSTEM "You are an expert George-AI assistant."\n')
    print_check("Ollama Modelfile prepared")

    # 6. Register with Ollama
    run([
        "ollama", "create", ollama_model_name, "-f", "Modelfile"
    ], cwd=model_folder)
    print_check("Registered with Ollama")

    print("\nAll steps completed. You can now run:")
    print(f"ollama run {ollama_model_name}")


if __name__ == "__main__":
    main()
