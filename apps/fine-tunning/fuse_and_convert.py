import os
import subprocess
import sys

# Paths — adjust llama_cpp to your actual checkout
# LLAMA_CPP = " ../../../../public/llama.cpp"
BASE_MODEL = "Qwen/Qwen2.5-Coder-0.5B-Instruct"
ADAPTER_PATH = "./adapters_Qwen25_Coder_05B_Instruct"
MERGED_MODEL = "./fused_model/qwen25_coder_05b_instruct_merged"
# GGUF_OUT = "./gguf_models/qwen25_coder_05b_instruct_merged.gguf"
# MODEFILE_PATH = "./Modelfile"
# OLLAMA_NAME = "qwen25-coder-05b-instruct"


def run_command(cmd, cwd=None):
    try:
        print("▶️", " ".join(cmd))
        subprocess.run(cmd, check=True, cwd=cwd)
    except subprocess.CalledProcessError:
        print(f"✖️ Error running: {' '.join(cmd)}")
        sys.exit(1)


def fuse_adapter():
    print("🔗 Fusing LoRA adapter into base model…")
    run_command([
        "python3", "-m", "mlx_lm.fuse",
        "--model", BASE_MODEL,
        "--adapter-path", ADAPTER_PATH,
        "--save-path", MERGED_MODEL
    ])
    print("✅ Adapter fused.")


# def convert_to_gguf():
#     print("🔄 Converting merged model to GGUF…")
#     convert_script = os.path.join(LLAMA_CPP, "convert_hf_to_gguf.py")
#     if not os.path.exists(convert_script):
#         print(f"✖️ Could not find conversion script at {convert_script}")
#         sys.exit(1)

#     run_command([
#         "python3",
#         convert_script,
#         MERGED_MODEL,
#         "--outfile", GGUF_OUT
#     ])
#     print("✅ GGUF conversion done.")


# def create_modelfile():
#     print("📄 Writing Modelfile for Ollama…")
#     with open(MODEFILE_PATH, "w") as f:
#         f.write(f"FROM {GGUF_OUT}\n")
#     print("✅ Modelfile created.")


# def build_ollama_model():
#     print("🏗️ Building Ollama model…")
#     run_command([
#         "ollama", "create", f"{OLLAMA_NAME}:latest",
#         "-f", MODEFILE_PATH
#     ])
#     print(f"✅ Ollama model `{OLLAMA_NAME}:latest` ready.")


# def main():
#     fuse_adapter()
#     convert_to_gguf()
#     create_modelfile()
#     build_ollama_model()
#     print("🎉 All done!")


# if __name__ == "__main__":
#     main()
