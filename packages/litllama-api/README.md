# Setting Up a REST API using Lightning Llama (lit-llama)

Lightning Llama is a powerful language model that you can interact with via a Python API. This guide will walk you through the steps to set up and use Lightning Llama on your Debian-based system.

## Prerequisites

Before you begin, ensure that your system meets the following requirements:

- Debian-based Linux distribution
- Nvidia GPU\*
- Git
- Python 3 and pip
- Anaconda (installed from [https://www.anaconda.com/download](https://www.anaconda.com/download))

\* **Nvidia Graphics Card Requirement:** This project requires an Nvidia graphics card with Turing architecture or above. Earlier architectures might lack the necessary features. The project is optimized for cards with a minimum of 8GB of memory.

## Installation

1. Update package lists and upgrade existing packages:

   ```
   sudo apt update
   sudo apt upgrade
   ```

2. Install Git and Python dependencies:

   ```
   sudo apt install git
   sudo apt install python3-pip
   ```

3. Download and install Anaconda (replace `2023.07-1` with the latest installer version):

   ```
   # Download Anaconda installer
   wget https://repo.anaconda.com/archive/Anaconda3-2023.07-1-Linux-x86_64.sh

   # Run the installer
   bash Anaconda3-2023.07-1-Linux-x86_64.sh

   ```

4. Create and activate a Conda environment:

   ```
   conda create -n ll
   conda activate ll
   ```

5. Install CUDA Toolkit:

   ```
   conda install cudatoolkit=11.7 -c nvidia
   ```

6. Clone the Lightning Llama repository and navigate to the directory:

   ```
   git clone https://github.com/Lightning-AI/lit-llama
   cd lit-llama
   ```

7. Add a directory to your PATH (replace `/home/YOUR_USERNAME` with your actual directory):

   ```
   export PATH="/home/YOUR_USERNAME:$PATH"
   ```

8. Set up a virtual environment and install Python dependencies:

   ```
   sudo apt-get install python3-venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

9. Download model weights:

   ```
   python3 scripts/download.py --repo_id openlm-research/open_llama_7b --local_dir checkpoints/open-llama/7B
   ```

10. Convert weights:

    ```
    python3 scripts/convert_hf_checkpoint.py --checkpoint_dir checkpoints/open-llama/7B --model_size 7B
    ```

11. Install SciPy:
    ```
    pip install scipy
    ```

## Using Lightning Llama

1. Now, we can test out Lightning Llama with the following command:

   ```
   python3 generate.py --quantize llm.int8 --prompt "Hello, my name is"
   ```

2. Create the Python API for Lightning Llama:

   ```
   pip install Flask
   curl -o API.py https://raw.githubusercontent.com/progwise/george-ai/dc286c9c69fb01b611b23a4cc3319a8d43a0c1de/packages/api/API.py
   ```

3. Run the Python API:

   ```
   python3 API.py
   ```

4. Interact with the API using curl (replace the prompt as needed):
   ```
   curl -X POST -H "Content-Type: application/json" -d '{"prompt": "Hello, my name is"}' http://127.0.0.1:5000/chat
   ```

That's it! You've successfully set up and used Lightning Llama on your system. Enjoy exploring and interacting with the language model!
