#!/usr/bin/env python3
"""
Split the original qa-data.jsonl into train/validation/test sets.
This script ensures proper data distribution and maintains data quality.
"""

import json
import random
import os
from collections import defaultdict


def split_original_dataset():
    """Split the original dataset into train/validation/test sets."""

    # Load the original dataset
    input_file = "jsonl/raw/qa-data.jsonl"
    output_dir = "jsonl/processed"

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Load all data
    data = []
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))

    print(f"Loaded {len(data)} entries from {input_file}")

    # Analyze data distribution
    categories = defaultdict(int)
    difficulties = defaultdict(int)

    for entry in data:
        # Handle different category formats
        if isinstance(entry.get('category'), list):
            for cat in entry['category']:
                categories[cat] += 1
        else:
            categories[entry.get('category', 'unknown')] += 1

        # Handle different difficulty formats
        if isinstance(entry.get('difficulty'), list):
            for diff in entry['difficulty']:
                difficulties[diff] += 1
        else:
            difficulties[entry.get('difficulty', 'unknown')] += 1

    print("\nCategory distribution:")
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count}")

    print("\nDifficulty distribution:")
    for diff, count in sorted(difficulties.items()):
        print(f"  {diff}: {count}")

    # Set random seed for reproducibility
    random.seed(42)

    # Shuffle data
    random.shuffle(data)

    # Split ratios: 80% train, 15% validation, 5% test
    total = len(data)
    train_size = int(0.80 * total)
    valid_size = int(0.15 * total)
    test_size = total - train_size - valid_size

    train_data = data[:train_size]
    valid_data = data[train_size:train_size + valid_size]
    test_data = data[train_size + valid_size:]

    print(f"\nSplit sizes:")
    print(f"  Train: {len(train_data)} ({len(train_data)/total*100:.1f}%)")
    print(
        f"  Validation: {len(valid_data)} ({len(valid_data)/total*100:.1f}%)")
    print(f"  Test: {len(test_data)} ({len(test_data)/total*100:.1f}%)")

    # Save splits
    train_file = os.path.join(output_dir, "train-original.jsonl")
    valid_file = os.path.join(output_dir, "valid-original.jsonl")
    test_file = os.path.join(output_dir, "test-original.jsonl")

    # Save train data
    with open(train_file, 'w', encoding='utf-8') as f:
        for entry in train_data:
            f.write(json.dumps(entry) + '\n')

    # Save validation data
    with open(valid_file, 'w', encoding='utf-8') as f:
        for entry in valid_data:
            f.write(json.dumps(entry) + '\n')

    # Save test data
    with open(test_file, 'w', encoding='utf-8') as f:
        for entry in test_data:
            f.write(json.dumps(entry) + '\n')

    print(f"\nSaved splits:")
    print(f"  Train: {train_file}")
    print(f"  Validation: {valid_file}")
    print(f"  Test: {test_file}")

    # Verify distribution in splits
    print(f"\nVerifying split distributions:")

    for split_name, split_data in [("Train", train_data), ("Validation", valid_data), ("Test", test_data)]:
        split_categories = defaultdict(int)
        split_difficulties = defaultdict(int)

        for entry in split_data:
            if isinstance(entry.get('category'), list):
                for cat in entry['category']:
                    split_categories[cat] += 1
            else:
                split_categories[entry.get('category', 'unknown')] += 1

            if isinstance(entry.get('difficulty'), list):
                for diff in entry['difficulty']:
                    split_difficulties[diff] += 1
            else:
                split_difficulties[entry.get('difficulty', 'unknown')] += 1

        print(f"\n{split_name} set category distribution:")
        for cat, count in sorted(split_categories.items()):
            percentage = count / len(split_data) * 100
            print(f"  {cat}: {count} ({percentage:.1f}%)")

        print(f"{split_name} set difficulty distribution:")
        for diff, count in sorted(split_difficulties.items()):
            percentage = count / len(split_data) * 100
            print(f"  {diff}: {count} ({percentage:.1f}%)")

    return train_file, valid_file, test_file


if __name__ == "__main__":
    split_original_dataset()
