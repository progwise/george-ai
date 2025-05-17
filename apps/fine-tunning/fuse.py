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
    print("Fusing LoRA adapter into base model...")
    run_command([
        "python3", "-m", "mlx_lm.fuse",
        "--model", BASE_MODEL,
        "--adapter-path", ADAPTER_PATH,
        "--save-path", MERGED_MODEL
    ])
    print("Adapter fused.")


if __name__ == "__main__":
    fuse_adapter()
