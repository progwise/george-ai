import os
import textwrap
from typing import Optional, List


def create_modelfile(
    gguf_file: str,
    modelfile_path: str,
    num_predict: int = 512,
    num_ctx: int = 4096,
    temperature: float = 0.7,
    top_p: float = 0.9,
    system_prompt: str = "You are an expert George-AI assistant.",
    use_template: bool = False,
    stop_sequences: Optional[List[str]] = None,
):
    """
    Create an Ollama Modelfile for a fine-tuned LLM.

    Args:
        gguf_file: Path to the GGUF model file.
        modelfile_path: Path where the Modelfile will be saved.
        num_predict: Max number of tokens to generate (hard cap).
        num_ctx: Context window size for the model.
        temperature: Sampling temperature.
        top_p: Nucleus sampling parameter.
        system_prompt: Default system message for the assistant.
        use_template: If True, adds a chat-style template.
        stop_sequences: Optional list of stop strings.
    """
    modelfile_dir = os.path.dirname(modelfile_path)
    relative_gguf_path = os.path.relpath(gguf_file, modelfile_dir)

    lines = [
        f"FROM {relative_gguf_path}",
        f"PARAMETER num_predict {num_predict}",
        f"PARAMETER num_ctx {num_ctx}",
        f"PARAMETER temperature {temperature}",
        f"PARAMETER top_p {top_p}",
    ]

    if stop_sequences:
        for stop in stop_sequences:
            # Escape newlines
            stop_escaped = stop.replace("\n", "\\n")
            lines.append(f'PARAMETER stop "{stop_escaped}"')

    if system_prompt:
        lines.append(f'SYSTEM "{system_prompt}"')

    if use_template:
        template = textwrap.dedent('''
        TEMPLATE """
        {{- if .System }}System: {{ .System }}\\n{{ end -}}
        User: {{ .Prompt }}
        Assistant:
        """
        ''')
        lines.append(template)

    with open(modelfile_path, "w") as f:
        f.write("\n".join(lines) + "\n")

    print(f"Modelfile created at {modelfile_path}")
