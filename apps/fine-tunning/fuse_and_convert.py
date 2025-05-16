import os
import subprocess
import sys

# Define paths
BASE_MODEL = "Qwen/Qwen2.5-Coder-0.5B-Instruct"
ADAPTER_PATH = "./adapters_Qwen25_Coder_05B_Instruct"
MERGED_MODEL_PATH = "./fused_model/qwen25_coder_05b_instruct_merged"
GGUF_MODEL_PATH = "./gguf_models/qwen25_coder_05b_instruct_merged.gguf"
MODEFILE_PATH = "./Modelfile"
OLLAMA_MODEL_NAME = "qwen25-coder-05b-instruct"


def run_command(command, cwd=None):
    """Run a shell command and handle errors."""
    try:
        subprocess.run(command, check=True, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while executing: {' '.join(command)}")
        sys.exit(1)


def fuse_adapter():
    """Fuse the LoRA adapter into the base model."""
    print("Fusing adapter into the base model...")
    run_command([
        "python3", "-m", "mlx_lm.fuse",
        "--model", BASE_MODEL,
        "--adapter-path", ADAPTER_PATH,
        "--save-path", MERGED_MODEL_PATH
    ])
    print(f"Adapter fused. Merged model saved at {MERGED_MODEL_PATH}")


def convert_to_gguf():
    """Convert the merged model to GGUF format."""
    print("Converting merged model to GGUF format...")
    run_command([
        "python3", "convert.py",
        MERGED_MODEL_PATH,
        GGUF_MODEL_PATH
    ])
    print(f"Conversion complete. GGUF model saved at {GGUF_MODEL_PATH}")


def create_modelfile():
    """Create a Modelfile for Ollama."""
    print("Creating Modelfile for Ollama...")
    with open(MODEFILE_PATH, "w") as f:
        f.write(f"FROM {GGUF_MODEL_PATH}\n")
    print(f"Modelfile created at {MODEFILE_PATH}")


def build_ollama_model():
    """Build the model in Ollama."""
    print("Building the model in Ollama...")
    run_command([
        "ollama", "create", f"{OLLAMA_MODEL_NAME}:latest", "-f", MODEFILE_PATH
    ])
    print(f"Ollama model '{OLLAMA_MODEL_NAME}:latest' created successfully.")


def main():
    fuse_adapter()
    convert_to_gguf()
    create_modelfile()
    build_ollama_model()
    print("All steps completed successfully.")


if __name__ == "__main__":
    main()
