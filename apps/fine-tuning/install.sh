#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/ggml-org/llama.cpp.git"
BRANCH="master"
TARGET_DIR="hf-to-gguf"
TMP_DIR=$(mktemp -d)

git clone --no-checkout --depth 1 "$REPO_URL" "$TMP_DIR"
cd "$TMP_DIR"
git sparse-checkout init --cone
git sparse-checkout set convert_hf_to_gguf.py gguf-py
git checkout "$BRANCH"

cd "$OLDPWD"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
mv "$TMP_DIR"/convert_hf_to_gguf.py "$TARGET_DIR"/
mv "$TMP_DIR"/gguf-py "$TARGET_DIR"/
rm -rf "$TMP_DIR"