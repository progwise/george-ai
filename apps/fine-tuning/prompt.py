"""
Run a prompt against a fine-tuned MLX-LM model.

USAGE EXAMPLES:

  python3 prompt.py --model Qwen/Qwen2.5-Coder-0.5B-Instruct --prompt "What is George AI?"
    # Uses the inferred adapter path for the given model.

  python3 prompt.py --model Qwen/Qwen2.5-Coder-7B-Instruct --prompt "Tell me a joke."
    # Uses the inferred adapter path for the given model.

The adapter path is inferred as: adapters_<model_name> (dots removed, dashes replaced with underscores).
"""

import argparse
import subprocess


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', required=True,
                        help="Name of the model (e.g., Qwen/Qwen2.5-Coder-7B-Instruct)")
    parser.add_argument('--prompt', required=True,
                        help="Prompt to pass to the model")

    args = parser.parse_args()

    adapter_path = f"adapters_{args.model.split('/')[-1].replace('.', '').replace('-', '_')}"

    command = [
        "python3", "-m", "mlx_lm.generate",
        "--model", args.model,
        "--max-tokens", "150",
        "--adapter-path", adapter_path,
        "--prompt", args.prompt
    ]

    subprocess.run(command)


if __name__ == "__main__":
    main()
