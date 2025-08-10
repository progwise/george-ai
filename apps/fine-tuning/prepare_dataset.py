#!/usr/bin/env python3
"""
Prepare QA dataset for fine-tuning with proper train/validation/test splits.
Optimized for small datasets to achieve >80% accuracy.
"""

import json
import random
import os
from pathlib import Path
from typing import List, Dict, Tuple

def load_qa_data(file_path: str) -> List[Dict]:
    """Load QA data from JSONL file."""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line.strip()))
    return data

def format_for_training(qa_pairs: List[Dict]) -> List[Dict]:
    """Format QA pairs for training with proper prompt structure."""
    formatted_data = []
    
    for qa in qa_pairs:
        # Handle difficulty field that might be string or list
        difficulty = qa.get("difficulty", "medium")
        if isinstance(difficulty, list):
            difficulty = difficulty[0] if difficulty else "medium"
        
        # Handle category field that might be string or list  
        category = qa.get("category", "general")
        if isinstance(category, list):
            category = category[0] if category else "general"
        
        # Create a structured prompt for better training
        formatted_entry = {
            "instruction": "Answer the following question about PressCrafters Printing Co. based on the given context.",
            "input": qa["prompt"],
            "output": qa["completion"],
            "metadata": {
                "difficulty": difficulty,
                "category": category,
                "source": qa.get("sourceDocument", "unknown")
            }
        }
        formatted_data.append(formatted_entry)
    
    return formatted_data

def stratified_split(data: List[Dict], train_ratio: float = 0.7, 
                    valid_ratio: float = 0.2, test_ratio: float = 0.1) -> Tuple[List, List, List]:
    """Split data while maintaining category distribution."""
    
    # Group by difficulty for stratified sampling
    difficulty_groups = {}
    for item in data:
        difficulty = item["metadata"]["difficulty"].lower()
        if difficulty not in difficulty_groups:
            difficulty_groups[difficulty] = []
        difficulty_groups[difficulty].append(item)
    
    train_data, valid_data, test_data = [], [], []
    
    for difficulty, items in difficulty_groups.items():
        random.shuffle(items)
        n = len(items)
        
        n_train = int(n * train_ratio)
        n_valid = int(n * valid_ratio)
        n_test = n - n_train - n_valid
        
        train_data.extend(items[:n_train])
        valid_data.extend(items[n_train:n_train + n_valid])
        test_data.extend(items[n_train + n_valid:])
    
    # Shuffle the final datasets
    random.shuffle(train_data)
    random.shuffle(valid_data)
    random.shuffle(test_data)
    
    return train_data, valid_data, test_data

def save_jsonl(data: List[Dict], file_path: str):
    """Save data to JSONL format."""
    with open(file_path, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

def create_training_splits(input_file: str, output_dir: str):
    """Create training, validation, and test splits."""
    
    # Set random seed for reproducibility
    random.seed(42)
    
    # Load and format data
    print(f"Loading data from {input_file}...")
    raw_data = load_qa_data(input_file)
    print(f"Loaded {len(raw_data)} QA pairs")
    
    # Format for training
    formatted_data = format_for_training(raw_data)
    
    # Create splits
    train_data, valid_data, test_data = stratified_split(formatted_data)
    
    print(f"Split sizes:")
    print(f"  Training: {len(train_data)} examples")
    print(f"  Validation: {len(valid_data)} examples") 
    print(f"  Test: {len(test_data)} examples")
    
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Save splits
    save_jsonl(train_data, os.path.join(output_dir, "train.jsonl"))
    save_jsonl(valid_data, os.path.join(output_dir, "valid.jsonl"))
    save_jsonl(test_data, os.path.join(output_dir, "test.jsonl"))
    
    # Create a combined file for ollama training
    all_training_data = train_data + valid_data  # Keep test separate for final evaluation
    save_jsonl(all_training_data, os.path.join(output_dir, "qa-data-formatted.jsonl"))
    
    print(f"Saved splits to {output_dir}")
    
    # Print sample for verification
    print("\nSample training example:")
    print(json.dumps(train_data[0], indent=2, ensure_ascii=False))
    
    return len(train_data), len(valid_data), len(test_data)

if __name__ == "__main__":
    input_file = "jsonl/raw/qa-data.jsonl"
    output_dir = "jsonl/processed"
    
    create_training_splits(input_file, output_dir)
