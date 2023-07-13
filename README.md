This is a mono repo for George, the AI worker for reading and analyzing websites like company intranets.

Main commands to setup the project:

sudo apt update
sudo apt upgrade
ubuntu-drivers devices
sudo ubuntu-drivers autoinstall
install anaconda
conda create -n ll
conda activate ll
conda install cudatoolkit=11.7 -c nvidia
install chrome
install vscode
install git
install pip
install conda
git clone https://github.com/Lightning-AI/lit-llama
cd lit-llama
add ```/home/mostafa``` to path ==> export PATH="/home/mostafa:$PATH"
pip install -r requirements.txt
# Download model weights
python3 scripts/download.py --repo_id openlm-research/open_llama_7b --local_dir checkpoints/open-llama/7B
# Convert weights:
python scripts/convert_hf_checkpoint.py --checkpoint_dir checkpoints/open-llama/7B --model_size 7B