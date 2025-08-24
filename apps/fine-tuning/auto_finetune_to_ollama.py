"""
Pipeline to fine-tune a Hugging Face model and get it working with Ollama.

USAGE:
    python3 auto_finetune_to_ollama.py <config_path>

This script will:
    - Split your dataset for training/validation/testing.
    - Fine-tune the specified base model using MLX-LM and save adapters.
    - Fuse the LoRA adapter into the base model.
    - Convert the fused model to GGUF format for Ollama/llama.cpp.
    - Prepare an Ollama Modelfile and register the model with Ollama.

Arguments:
    Path the address to a JSON config file like the exaple below.

If any required information is missing from the config, you will be prompted interactively.

CONFIG FILE FORMAT (JSON):
{
    "base_model": "jphme/em_german_leo_mistral",
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
    "ollama_model_name": "em-german-leo-mistral-george",
    "keep_split_data": true,
    "keep_fused_model": true,
    "keep_gguf_files": true,
    "keep_adapter_weights": true,
    "test_prompt": "Why is the sky blue?"
}

Outputs:
    All intermediate and final files (split data, adapters, fused model, GGUF, Modelfile) are stored in the working directory.

Example:
    python3 auto_finetune_to_ollama.py finetune_ollama_config_mistral.json
    
    Example to run the fine-tuned model with Ollama:
        ollama run ollama_model_name
"""

import os
import json
import subprocess
import sys
import shutil
from create_modelfile import create_modelfile


# def create_modelfile(gguf_file, modelfile_path):
#     # Ollama requires the FROM path to be relative to the Modelfile
#     modelfile_dir = os.path.dirname(modelfile_path)
#     relative_gguf_path = os.path.relpath(gguf_file, modelfile_dir)

#     with open(modelfile_path, "w") as f:
#         f.write(f"FROM {relative_gguf_path}\n")
#         f.write("PARAMETER num_predict 512\n")
#         f.write("# Optional parameters for model configuration:\n")
#         f.write("# PARAMETER temperature 0.7\n")
#         f.write('# SYSTEM "You are an expert George-AI assistant."\n')
#     print(f"Modelfile created at {modelfile_path}.")


def cleanup(paths):
    for path in paths:
        if os.path.isdir(path):
            shutil.rmtree(path)
            print(f"Deleted directory: {path}")
        elif os.path.isfile(path):
            os.remove(path)
            print(f"Deleted file: {path}")


def main(config_path):
    with open(config_path, "r") as f:
        config = json.load(f)

    base_model = config["base_model"]
    dataset_path = config["dataset_path"]
    train_ratio = config["train_ratio"]
    valid_ratio = config["valid_ratio"]
    test_ratio = config["test_ratio"]
    fine_tune_params = config["fine_tune_params"]
    ollama_model_name = config["ollama_model_name"]
    test_prompt = config.get("test_prompt")

    keep_split_data = config.get("keep_split_data", False)
    keep_fused_model = config.get("keep_fused_model", False)
    keep_gguf_files = config.get("keep_gguf_files", False)
    keep_adapter_weights = config.get("keep_adapter_weights", False)
    adapter_weights_dir = config.get("adapter_weights_dir", None)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_root = os.path.join(script_dir, "finetune-output")
    os.makedirs(output_root, exist_ok=True)

    model_name = ollama_model_name.split(":")[0]
    model_dir = os.path.join(output_root, model_name)
    os.makedirs(model_dir, exist_ok=True)

    split_output_dir = os.path.join(model_dir, "split_output")
    fused_model_dir = os.path.join(model_dir, "fused_model")
    gguf_model_dir = os.path.join(model_dir, "gguf_model")
    gguf_file = os.path.join(gguf_model_dir, f"{model_name}_fp16.gguf")
    modelfile_path = os.path.join(model_dir, "modelfile")

    if not adapter_weights_dir:
        for entry in os.listdir(model_dir):
            if entry.startswith("adapters_") and os.path.isdir(os.path.join(model_dir, entry)):
                adapter_weights_dir = os.path.join(model_dir, entry)
                break

    # Split the dataset
    print("Splitting the dataset...")
    subprocess.run([
        "python3", "split_dataset.py", dataset_path,
        "--train", str(train_ratio),
        "--valid", str(valid_ratio),
        "--test", str(test_ratio),
        "--output", split_output_dir
    ])
    print("[ok]")

    # Fine-tune the model
    print("Fine-tuning the model...")

    # Build command with fine-tuning parameters
    fine_tune_cmd = [
        "python3", "fine_tune.py",
        "--model", base_model,
        "--data", split_output_dir,
        "--adapter-dir", model_dir
    ]

    # Add fine-tuning parameters if they exist
    if "num_layers" in fine_tune_params:
        fine_tune_cmd.extend(
            ["--num-layers", str(fine_tune_params["num_layers"])])
    if "learning_rate" in fine_tune_params:
        fine_tune_cmd.extend(
            ["--learning-rate", str(fine_tune_params["learning_rate"])])
    if "iters" in fine_tune_params:
        fine_tune_cmd.extend(["--iters", str(fine_tune_params["iters"])])
    if "fine_tune_type" in fine_tune_params:
        fine_tune_cmd.extend(
            ["--fine-tune-type", fine_tune_params["fine_tune_type"]])

    subprocess.run(fine_tune_cmd)
    print("[ok]")

    # Fuse adapter weights
    print("Fusing adapter weights...")
    adapter_path = None
    for entry in os.listdir(model_dir):
        full_path = os.path.join(model_dir, entry)
        if entry.startswith("adapters_") and os.path.isdir(full_path):
            adapter_path = full_path
            break

    if adapter_path is None:
        print("Error: No adapter weights found! Fine-tuning may have failed.")
        print(f"Checked directory: {model_dir}")
        print("Available directories:")
        for entry in os.listdir(model_dir):
            if os.path.isdir(os.path.join(model_dir, entry)):
                print(f"  - {entry}")
        return

    fused_model_dir = os.path.join(model_dir, "fused_model")
    fused_model_name = f"{model_name.replace('.', '').replace('-', '_')}_fused"
    fused_model_path = os.path.join(fused_model_dir, fused_model_name)

    subprocess.run([
        "python3", "-m", "mlx_lm.fuse",
        "--model", base_model,
        "--adapter-path", adapter_path,
        "--save-path", fused_model_path
    ])
    print("[ok]")

    # Convert to .gguf format
    print("Converting to .gguf format...")
    os.makedirs(os.path.dirname(gguf_file), exist_ok=True)
    conversion_input_dir = fused_model_path
    subprocess.run([
        "python3", "hf-to-gguf/convert_hf_to_gguf.py",
        conversion_input_dir,
        "--outfile", gguf_file,
        "--outtype", "f16"
    ])
    print("[ok]")

    # Create the modelfile
    print("Creating the modelfile...")
    create_modelfile(gguf_file, modelfile_path)
    print("[ok]")

    # Step 6: Register the model with Ollama
    print("Registering the model with Ollama...")
    # Run ollama create from the model directory to handle relative paths correctly
    subprocess.run(
        ["ollama", "create", ollama_model_name, "-f", "modelfile"],
        cwd=model_dir
    )
    print("[ok]")

    print(
        f"Model '{ollama_model_name}' successfully created and registered with Ollama.")

    # Step 7: Test the model with a prompt if provided
    if test_prompt:
        print(f"\n--- Testing model '{ollama_model_name}' ---")
        print(f">>> Prompt: {test_prompt}")

        # Use subprocess.run to send the prompt to `ollama run`
        # The command will exit after processing the input.
        result = subprocess.run(
            ["ollama", "run", ollama_model_name],
            input=test_prompt,
            capture_output=True,
            text=True,
            check=False
        )

        if result.returncode == 0:
            print("<<< Response:")
            print(result.stdout.strip())
            print("--- Test complete ---")
        else:
            print("--- Test failed ---")
            print("Error running the model with Ollama.")
            print("Stderr:", result.stderr.strip())
            print("-------------------")

    # Cleanup intermediary files and directories
    cleanup_targets = []
    if not keep_split_data:
        cleanup_targets.append(split_output_dir)
    if not keep_fused_model:
        cleanup_targets.append(fused_model_dir)
    if not keep_gguf_files:
        cleanup_targets.append(gguf_model_dir)
    if not keep_adapter_weights and adapter_weights_dir:
        cleanup_targets.append(adapter_weights_dir)
    if cleanup_targets:
        print("Cleaning up intermediary files and directories...")
        cleanup(cleanup_targets)
    else:
        print("All intermediary files and directories are kept (according to the config file).")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 auto_finetune_to_ollama.py <config_path>")
        sys.exit(1)

    config_path = sys.argv[1]
    main(config_path)
