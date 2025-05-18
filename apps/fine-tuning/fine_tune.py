import argparse
import sys
import mlx_lm.lora

def run_finetune(model_name: str, data_folder: str):
    adapter_path = f"adapters_{model_name.split('/')[-1].replace('.', '').replace('-', '_')}"

    # Simulate CLI args for mlx_lm.lora.main()
    sys.argv = [
        "lora",
        "--model", model_name,
        "--train",
        "--data", data_folder,
        "--num-layers", "4",
        "--learning-rate", "1e-5",
        "--iters", "100",
        "--fine-tune-type", "lora",
        "--adapter-path", adapter_path
    ]

    mlx_lm.lora.main()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run LoRA fine-tuning using mlx_lm.lora")
    parser.add_argument("--model", required=True, help="Model name, e.g., Qwen/Qwen2.5-Coder-0.5B-Instruct")
    parser.add_argument("--data", required=True, help="Path to the dataset folder")

    args = parser.parse_args()
    run_finetune(args.model, args.data)
