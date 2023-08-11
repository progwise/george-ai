```
sudo apt update
sudo apt upgrade
ubuntu-drivers devices
sudo ubuntu-drivers autoinstall
sudo apt install git
sudo apt install python3-pip
Download Anaconda form: https://www.anaconda.com/download
Ex: bash Anaconda3-2023.07-1-Linux-x86_64.sh
conda create -n ll
conda activate ll
conda install cudatoolkit=11.7 -c nvidia
git clone https://github.com/Lightning-AI/lit-llama
cd lit-llama
add ```/home/mostafa``` to path ==> export PATH="/home/mostafa:$PATH"
sudo apt-get install python3-venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Download model weights
python3 scripts/download.py --repo_id openlm-research/open_llama_7b --local_dir checkpoints/open-llama/7B
# Convert weights:
python3 scripts/convert_hf_checkpoint.py --checkpoint_dir checkpoints/open-llama/7B --model_size 7B
# Install SciPy
pip install scipy
python3 generate.py --quantize llm.int8 --prompt "Hello, my name is"

# Creating the Python API
pip install Flask
curl -o API.py https://raw.githubusercontent.com/splendidcomputer/my-lit-llama/main/API.py?token=GHSAT0AAAAAACFILF32TRSFX2ASF4KXBAFSZGWKFGA

# Runnig the API
python3 API.py

curl -X POST -H "Content-Type: application/json" -d '{"prompt": "Hello, my name is"}' http://127.0.0.1:5000/chat

```
