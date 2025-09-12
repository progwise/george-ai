# Playground for MLX version of qwen2.5vl 7B running on Apple Silocon without OLLAMA

Steps

```bash
#Must run outside of docker on a mac

python3 -m venv .venv
source .venv/bin/activate
pip install torch torchvision
pip install mlx-vlm

python -m mlx_vlm generate --model mlx-community/Qwen2.5-VL-7B-Instruct-4bit --max-tokens 100 --temp 0.0 --prompt "Describe this image." --image page-1.png

```

This downloads the mlx version of Qwen2.5-VL into ~/.cache/huggingface/hub

Good luck.
