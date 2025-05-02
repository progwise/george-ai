import sys
import json
import random
from pathlib import Path

def load_jsonl(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return [json.loads(line) for line in f]

def write_jsonl(data, file_path):
    with open(file_path, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

def split_dataset(data, output_dir):
    random.shuffle(data)
    total = len(data)
    test_size = int(total * 0.1)
    valid_size = int(total * 0.1)
    train_size = total - test_size - valid_size

    train_data = data[:train_size]
    valid_data = data[train_size:train_size + valid_size]
    test_data  = data[train_size + valid_size:]

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    write_jsonl(train_data, f"{output_dir}/train.jsonl")
    write_jsonl(valid_data, f"{output_dir}/valid.jsonl")
    write_jsonl(test_data, f"{output_dir}/test.jsonl")

    print(f"Dataset split complete. Total: {total}")
    print(f"Train: {len(train_data)}, Valid: {len(valid_data)}, Test: {len(test_data)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 split_dataset.py <input_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_directory = "split_output"
    dataset = load_jsonl(input_file)
    split_dataset(dataset, output_directory)
