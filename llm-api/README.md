1. How to start and fine tune a onPremise LLM
# my-lit-llama
How to run lit-llama

## Commands:

### Clone the repo:

```
git clone https://github.com/Lightning-AI/lit-llama
cd lit-llama
```
### Install the requirements:

```
pip install -r requirements.txt
```

### Download llama weights data:

```
python scripts/download.py --repo_id openlm-research/open_llama_7b --local_dir checkpoints/open-llama/7B
```

## Customize paths

The project is setup to use specific paths to read the original weights and save checkpoints etc.

For all scripts, you can run

```shell
python script.py -h
```

to get a list of available options. For instance, here's how you would modify the checkpoint dir:

```shell
python scripts/convert_checkpoint.py --checkpoint_dir "data/checkpoints/foo"
```

Note that this change will need to be passed along to subsequent steps, for example:

```shell
python generate.py \
  --checkpoint_path "data/checkpoints/foo/7B/lit-llama.pth" \
  --tokenizer_path "data/checkpoints/foo/tokenizer.model"
```

and

```shell
python quantize/gptq.py \
  --checkpoint_path "data/checkpoints/foo/7B/lit-llama.pth" \
  --tokenizer_path "data/checkpoints/foo/tokenizer.model"
```

To avoid this, you can use symbolic links to create shortcuts and avoid passing different paths.


### Install SciPy
```
 pip install scipy 

```


2. How to use OpenAI API instead

How to decide which to use
