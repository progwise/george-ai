#!/bin/bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
crawl4ai-setup
fastapi run src/main.py --port 11245