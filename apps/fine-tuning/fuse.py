"""
Fuse a LoRA adapter into a base model using mlx_lm.fuse.

USAGE EXAMPLES:

  python3 fuse.py --base-model Qwen/Qwen2.5-Coder-0.5B-Instruct
    # Uses inferred adapter and merged model paths.

  python3 fuse.py --base-model Qwen/Qwen2.5-Coder-0.5B-Instruct --adapter-path ./adapters_Qwen25_Coder_05B_Instruct
    # Uses custom adapter path, merged model path is inferred.

  python3 fuse.py --base-model Qwen/Qwen2.5-Coder-0.5B-Instruct --adapter-path ./adapters_Qwen25_Coder_05B_Instruct --merged-model ./fused_model/qwen25_coder_05b_instruct_merged
    # All paths provided explicitly.

If --adapter-path or --merged-model are not provided, they are inferred from --base-model.
"""

import os
import subprocess
import sys
import argparse


def infer_adapter_path(base_model):
    # e.g. Qwen/Qwen2.5-Coder-0.5B-Instruct -> adapters_Qwen25_Coder_05B_Instruct
    name = base_model.split("/")[-1].replace(".", "").replace("-", "_")
    return f"./adapters_{name}"


def infer_merged_model(base_model):
    # e.g. Qwen/Qwen2.5-Coder-0.5B-Instruct -> ./fused_model/qwen25_coder_05b_instruct_merged
    name = base_model.split("/")[-1].replace(".", "").replace("-", "_").lower()
    return f"./fused_model/{name}_merged"


def run_command(cmd, cwd=None):
    try:
        print(">", " ".join(cmd))
        subprocess.run(cmd, check=True, cwd=cwd)
    except subprocess.CalledProcessError:
        print(f"Error running: {' '.join(cmd)}")
        sys.exit(1)


def fuse_adapter(base_model, adapter_path=None, merged_model=None):
    if not adapter_path:
        adapter_path = infer_adapter_path(base_model)
    if not merged_model:
        merged_model = infer_merged_model(base_model)
    print(
        f"Fusing LoRA adapter into base model...\nBASE_MODEL={base_model}\nADAPTER_PATH={adapter_path}\nMERGED_MODEL={merged_model}")
    run_command([
        "python3", "-m", "mlx_lm.fuse",
        "--model", base_model,
        "--adapter-path", adapter_path,
        "--save-path", merged_model
    ])
    print("Adapter fused.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Fuse LoRA adapter into base model using mlx_lm.fuse")
    parser.add_argument("--base-model", required=True,
                        help="Base model name, e.g. Qwen/Qwen2.5-Coder-0.5B-Instruct")
    parser.add_argument(
        "--adapter-path", help="Path to LoRA adapter (default: inferred from base model)")
    parser.add_argument(
        "--merged-model", help="Path to save merged model (default: inferred from base model)")
    args = parser.parse_args()
    fuse_adapter(args.base_model, args.adapter_path, args.merged_model)
