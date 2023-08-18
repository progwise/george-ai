# Setting Up a REST API using Lightning Llama (Lit-LLaMA)

[Lit-LLaMA](https://github.com/Lightning-AI/lit-llama) serves as a comprehensive platform for executing the [OpenLLaMA](https://github.com/openlm-research/open_llama) Large Language Model (LLM). This guide is dedicated to facilitating the setup and utilization of Lit-LLaMA on your Debian-based system. Notably, Lit-LLaMA stands as a rendition of LLaMA's pretraining, fine-tuning, and inference code, all made accessible as open-source content governed by the [**Apache 2.0 license**](https://www.apache.org/licenses/LICENSE-2.0).

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

   **Explanation**: These commands update the list of available software packages and upgrade the ones that are already installed on your system.

2. Install Git and Python dependencies:

   ```
   sudo apt install git
   sudo apt install python3-pip
   ```

   **Explanation**: These commands install [Git](https://git-scm.com/), a version control tool, and [`pip`](https://pypi.org/project/pip/), a package manager for Python, which are required for managing the project's code and dependencies.

3. Download and install Anaconda (replace `2023.07-1` with the latest installer version):

   ```
   # Download Anaconda installer
   wget https://repo.anaconda.com/archive/Anaconda3-2023.07-1-Linux-x86_64.sh

   # Run the installer
    Anaconda3-2023.07-1-Linux-x86_64.sh
   ```

   **Explanation**: [Anaconda](https://www.anaconda.com/) is a platform that simplifies Python package management and environment creation. These commands download the Anaconda installer and run it.

4. Create and activate a Conda environment:

   ```
   conda create -n ll
   conda activate ll
   ```

   **Explanation**: This creates a virtual Python environment named 'll' and activates it. It helps isolate the project's dependencies from your system's global Python environment.

   **"Anaconda vs. Conda: Package Management Simplified"**

   "Anaconda" is an all-in-one Python distribution bundled with the "Conda" package manager. "Conda" is a standalone tool that streamlines package installation and environment setup. While "Anaconda" offers a curated package collection, "Conda" empowers efficient package management and isolated environments for Python development.

5. Install CUDA Toolkit:

   ```
   conda install cudatoolkit=11.7 -c nvidia
   ```

   **Explanation**: This installs the [CUDA Toolkit](https://developer.nvidia.com/cuda-toolkit), which is essential for utilizing GPU acceleration in deep learning tasks.

   **CUDA** (or Compute Unified Device Architecture) is a parallel computing platform and Application Programming Interface (API) developed by NVIDIA for utilizing the power of Graphics Processing Units (GPUs) to accelerate computation tasks.

   **CUDA Toolkit** is a comprehensive set of libraries, tools, and APIs provided by NVIDIA to develop GPU-accelerated applications. It includes libraries for linear algebra, image processing, machine learning, and more, enabling programmers to harness the computational capabilities of GPUs for various tasks.

6. Clone the Lit-LLaMA repository and navigate to the directory:

   ```
   git clone https://github.com/Lightning-AI/lit-llama
   cd lit-llama
   ```

   **Explanation**: These commands download the code for Lit-LLaMA from its GitHub repository and navigate into the project directory.

7. Add a directory to your PATH (replace `/home/YOUR_USERNAME` with your actual directory):

   ```
   export PATH="/home/YOUR_USERNAME:$PATH"
   ```

   **Explanation**: This command adds a directory to the system's [ PATH](https://wiki.debian.org/EnvironmentVariables), making it easier to run scripts and programs from that directory.

8. Set up a virtual environment and install Python dependencies:

   ```
   sudo apt-get install python3-venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

   **Explanation**: These commands set up a virtual environment for Python, activate it, and install necessary Python libraries listed in the `requirements.txt` file.

9. Download model weights:

   ```
   python3 scripts/download.py --repo_id openlm-research/open_llama_7b --local_dir checkpoints/open-llama/7B
   ```

   **Explanation**: This Python script downloads pretrained model weights from a specific repository and saves them in the project directory.

10. Convert weights:

    ```
    python3 scripts/convert_hf_checkpoint.py --checkpoint_dir checkpoints/open-llama/7B --model_size 7B
    ```

    **Explanation**: This command converts the downloaded model weights to a specific format using a conversion script.

11. Install SciPy:

    ```
    pip install scipy
    ```

    **Explanation**: This command installs the [SciPy](https://www.scipy.org/) library, which provides tools for scientific and technical computing.

## Using Lit-LLaMA

1. Now, we can test out Lit-LLaMA with the following command:

   ```
   python3 generate.py --quantize llm.int8 --prompt "Hello, my name is"
   ```

   **Explanation**: This command generates text using the Lit-LLaMA model based on a provided prompt.

## Creating and Using the REST API for Lit-LLaMA

1. Create the REST API for Lit-LLaMA:

   ```
   pip install Flask
   curl -o API.py https://raw.githubusercontent.com/progwise/george-ai/dc286c9c69fb01b611b23a4cc3319a8d43a0c1de/packages/api/API.py
   ```

   **Explanation**: These commands install the [Flask](https://flask.palletsprojects.com/) library, a lightweight and versatile Python web framework that simplifies building web applications and APIs. Additionally, [cURL](https://curl.se/) is a command-line tool and library designed for data transfers via URLs. cURL enables tasks such as sending HTTP requests, downloading files, and interacting with web APIs directly from the command line.

2. Run the API:

   ```
   python3 API.py
   ```

   **Explanation**: This command starts the Flask server, making the API available for interactions.

3. Interact with the API using curl (replace the prompt as needed):

   ```
   curl -X POST -H "Content-Type: application/json" -d '{"prompt": "Hello, my name is"}' http://127.0.0.1:5000/chat
   ```

   **Explanation**: This `curl` command sends a POST request to the API, interacting with the Lit-LLaMA model and receiving responses.

You should have now adeptly configured and utilized the Lit-LLaMA API on your system. Embark on an enriching journey of exploration and interaction with this sophisticated language model.
