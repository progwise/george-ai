I. How to start and fine tune a onPremise LLM

1. Update the system's package index to retrieve the latest information about available packages.
   ```shell
   sudo apt update
   ```

2. Upgrade installed packages to their latest versions.
   ```shell
   sudo apt upgrade
   ```

3. List the available drivers for Ubuntu-compatible hardware devices.
   ```shell
   ubuntu-drivers devices
   ```

4. Automatically install the recommended proprietary drivers for the detected hardware devices on Ubuntu.
   ```shell
   sudo ubuntu-drivers autoinstall
   ```

5. Install Git, a version control system for tracking changes in source code.
   ```shell
   sudo apt install git
   ```

6. Install Python 3 package manager, pip.
   ```shell
   sudo apt install python3-pip
   ```

7. Download Anaconda from [https://www.anaconda.com/download](https://www.anaconda.com/download). Run the downloaded script to install Anaconda.
   ```shell
   # Replace <Anaconda_file.sh> with the actual file name
   bash <Anaconda_file.sh>
   ```

8. Create a new conda environment named "ll".
   ```shell
   conda create -n ll
   ```

9. Activate the "ll" conda environment.
   ```shell
   conda activate ll
   ```

10. Install the CUDA Toolkit version 11.7 from the NVIDIA channel within the "ll" conda environment.
    ```shell
    conda install cudatoolkit=11.7 -c nvidia
    ```

11. Clone the lit-llama repository from GitHub.
    ```shell
    git clone https://github.com/Lightning-AI/lit-llama
    ```

12. Change the current working directory to the "lit-llama" directory.
    ```shell
    cd lit-llama
    ```

13. Add `/home/mostafa` to the system's PATH environment variable.
    ```shell
    export PATH="/home/mostafa:$PATH"
    ```

14. Install the Python package dependencies specified in the "requirements.txt" file.
    ```shell
    pip install -r requirements.txt
    ```

15. Download model weights from a specific repository and save them to the local directory.
    ```shell
    python3 scripts/download.py --repo_id openlm-research/open_llama_7b --local_dir checkpoints/open-llama/7B
    ```

16. Convert the downloaded model weights to a specific format.
    ```shell
    python3 scripts/convert_hf_checkpoint.py --checkpoint_dir checkpoints/open-llama/7B --model_size 7B
    ```

17. Install the SciPy library for scientific computation.
    ```shell
    pip install scipy
    ```

18. Generate output based on a given prompt using the specified model and settings.
    ```shell
    python3 generate.py --quantize llm.int8 --prompt "Hello, my name is"
    ```

These instructions should help you replicate the lit-llama project successfully.
II. How to use OpenAI API instead

How to decide which to use
