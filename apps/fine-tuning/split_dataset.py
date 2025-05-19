"""
split_dataset.py

Split a dataset in JSONL format into training, validation, and test sets
based on specified ratios.

Usage:
    python3 split_dataset.py input_file.jsonl --train 0.8 --valid 0.1 --test 0.1 --output split_output

"""

import json
import random
from pathlib import Path
import argparse


def load_jsonl(file_path):
    """Load a JSONL file and return a list of dictionaries."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return [json.loads(line) for line in f]


def write_jsonl(data, file_path):
    """Write a list of dictionaries to a JSONL file."""
    with open(file_path, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')


def split_dataset(data, output_dir, train_ratio, valid_ratio, test_ratio):
    """Shuffle and split the dataset and write it to files."""
    total = len(data)
    random.shuffle(data)

    total_ratio = train_ratio + valid_ratio + test_ratio
    if not 0.999 <= total_ratio <= 1.001:
        raise ValueError(f"Ratios must sum to 1.0. Current sum: {total_ratio}")

    train_end = int(total * train_ratio)
    valid_end = train_end + int(total * valid_ratio)

    train_data = data[:train_end]
    valid_data = data[train_end:valid_end]
    test_data = data[valid_end:]

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    write_jsonl(train_data, Path(output_dir) / "train.jsonl")
    write_jsonl(valid_data, Path(output_dir) / "valid.jsonl")
    write_jsonl(test_data, Path(output_dir) / "test.jsonl")

    print(f"Dataset split complete. Total: {total}")
    print(
        f"Train: {len(train_data)}, Valid: {len(valid_data)}, Test: {len(test_data)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Split a JSONL dataset into train/valid/test sets.")
    parser.add_argument("input_file", help="Path to the input JSONL file.")
    parser.add_argument("--output", default="split_output",
                        help="Directory to save the split files.")
    parser.add_argument("--train", type=float, default=0.8,
                        help="Proportion for training set.")
    parser.add_argument("--valid", type=float, default=0.1,
                        help="Proportion for validation set.")
    parser.add_argument("--test", type=float, default=0.1,
                        help="Proportion for test set.")

    args = parser.parse_args()

    dataset = load_jsonl(args.input_file)
    split_dataset(dataset, args.output, args.train, args.valid, args.test)
