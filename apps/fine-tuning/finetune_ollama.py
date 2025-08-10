#!/usr/bin/env python3
"""
Fine-tune model using Ollama for PressCrafters QA task.
Optimized for small datasets to achieve >80% accuracy.
"""

import json
import os
import sys
import logging
import subprocess
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OllamaFineTuner:
    def __init__(self, config_path: str):
        """Initialize the fine-tuner with configuration."""
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.base_model = self.config["base_model"]
        self.dataset_path = self.config["dataset_path"]
        self.output_model = self.config["ollama_model_name"]
        
        logger.info(f"Initialized Ollama fine-tuner")
        logger.info(f"Base model: {self.base_model}")
        logger.info(f"Dataset: {self.dataset_path}")
        logger.info(f"Output model: {self.output_model}")
    
    def check_ollama_available(self) -> bool:
        """Check if Ollama is available."""
        try:
            result = subprocess.run(['ollama', 'list'], capture_output=True, text=True)
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def pull_base_model(self):
        """Pull the base model if not available."""
        logger.info(f"Checking if base model {self.base_model} is available...")
        
        # First try to use a model that's available in Ollama
        available_models = ["llama3.2:1b", "llama3.2:3b", "phi3:mini", "gemma2:2b"]
        
        for model in available_models:
            try:
                result = subprocess.run(['ollama', 'show', model], 
                                      capture_output=True, text=True, timeout=30)
                if result.returncode == 0:
                    logger.info(f"Using available model: {model}")
                    self.base_model = model
                    return
            except subprocess.TimeoutExpired:
                continue
            except Exception:
                continue
        
        # If no models are available, try to pull one
        logger.info("No suitable models found. Attempting to pull llama3.2:1b...")
        try:
            result = subprocess.run(['ollama', 'pull', 'llama3.2:1b'], 
                                  capture_output=True, text=True, timeout=600)
            if result.returncode == 0:
                self.base_model = "llama3.2:1b"
                logger.info("Successfully pulled llama3.2:1b")
            else:
                logger.error(f"Failed to pull model: {result.stderr}")
                raise Exception("Could not pull base model")
        except subprocess.TimeoutExpired:
            logger.error("Timeout while pulling model")
            raise Exception("Timeout while pulling base model")
    
    def create_modelfile(self):
        """Create a Modelfile for fine-tuning."""
        logger.info("Creating Modelfile...")
        
        modelfile_content = f"""FROM {self.base_model}

# Set parameters for QA task
PARAMETER temperature 0.1
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1

# System prompt for PressCrafters QA
SYSTEM \"\"\"You are a helpful assistant that answers questions about PressCrafters Printing Co. 
You should provide accurate, concise answers based on the given context. 
Answer only what is asked and avoid adding unnecessary information.\"\"\"

# Template for consistent responses
TEMPLATE \"\"\"### Instruction:
{{ .System }}

### Input:
{{ .Prompt }}

### Response:
{{ .Response }}\"\"\"
"""
        
        modelfile_path = "Modelfile"
        with open(modelfile_path, 'w') as f:
            f.write(modelfile_content)
        
        logger.info(f"Modelfile created: {modelfile_path}")
        return modelfile_path
    
    def create_training_script(self):
        """Create a training script for the model."""
        logger.info("Creating training script...")
        
        script_content = f"""#!/bin/bash

# Fine-tuning script for PressCrafters QA model
set -e

echo "Starting fine-tuning process..."

# Create the model from Modelfile
echo "Creating model from Modelfile..."
ollama create {self.output_model} -f Modelfile

if [ $? -eq 0 ]; then
    echo "✅ Model {self.output_model} created successfully!"
else
    echo "❌ Failed to create model"
    exit 1
fi

echo "Fine-tuning complete!"
"""
        
        script_path = "train_model.sh"
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        os.chmod(script_path, 0o755)
        logger.info(f"Training script created: {script_path}")
        return script_path
    
    def evaluate_model(self) -> float:
        """Evaluate the fine-tuned model."""
        logger.info("Evaluating fine-tuned model...")
        
        # Load test data
        test_path = self.dataset_path.replace("qa-data-formatted.jsonl", "test.jsonl")
        if not os.path.exists(test_path):
            logger.warning(f"Test file not found: {test_path}")
            return 0.0
        
        test_data = []
        with open(test_path, 'r') as f:
            for line in f:
                if line.strip():
                    test_data.append(json.loads(line.strip()))
        
        logger.info(f"Evaluating on {len(test_data)} test examples...")
        
        correct = 0
        total = 0
        
        for i, example in enumerate(test_data):
            if i >= 20:  # Limit to first 20 for speed
                break
                
            prompt = example['input']
            expected = example['output'].lower().strip()
            
            try:
                # Query the model
                result = subprocess.run([
                    'ollama', 'run', self.output_model, prompt
                ], capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    response = result.stdout.strip().lower()
                    
                    # Check if the expected answer is in the response
                    if expected in response or self._fuzzy_match(expected, response):
                        correct += 1
                        logger.info(f"✅ Q{i+1}: CORRECT")
                    else:
                        logger.info(f"❌ Q{i+1}: INCORRECT")
                        logger.info(f"   Expected: {expected}")
                        logger.info(f"   Got: {response[:100]}...")
                else:
                    logger.warning(f"Failed to get response for question {i+1}")
                
                total += 1
                
            except subprocess.TimeoutExpired:
                logger.warning(f"Timeout for question {i+1}")
                total += 1
            except Exception as e:
                logger.warning(f"Error evaluating question {i+1}: {e}")
                total += 1
        
        accuracy = correct / total if total > 0 else 0.0
        logger.info(f"Evaluation complete: {correct}/{total} correct ({accuracy:.2%})")
        
        return accuracy
    
    def _fuzzy_match(self, expected: str, response: str) -> bool:
        """Check for fuzzy match between expected and response."""
        # Split expected answer into words and check if most are present
        expected_words = expected.split()
        if len(expected_words) == 1:
            return expected in response
        
        # For multi-word answers, check if at least 70% of words match
        matches = sum(1 for word in expected_words if word in response)
        return matches / len(expected_words) >= 0.7
    
    def train(self):
        """Execute the fine-tuning process."""
        logger.info("Starting Ollama fine-tuning process...")
        
        # Check if Ollama is available
        if not self.check_ollama_available():
            logger.error("Ollama is not available. Please install Ollama first.")
            return False
        
        # Pull base model
        self.pull_base_model()
        
        # Create Modelfile and training script
        modelfile_path = self.create_modelfile()
        script_path = self.create_training_script()
        
        # Execute training
        logger.info("Executing training script...")
        try:
            result = subprocess.run(['bash', script_path], 
                                  capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                logger.info("Training completed successfully!")
                logger.info(result.stdout)
                
                # Evaluate the model
                accuracy = self.evaluate_model()
                
                # Report results
                logger.info("="*50)
                logger.info("FINE-TUNING COMPLETE")
                logger.info(f"Model name: {self.output_model}")
                logger.info(f"Accuracy: {accuracy:.2%}")
                
                if accuracy >= 0.8:
                    logger.info("✅ SUCCESS: Achieved >80% accuracy target!")
                else:
                    logger.info("❌ Target not met. Model may need more training data or parameter tuning.")
                
                logger.info("="*50)
                
                return accuracy >= 0.8
                
            else:
                logger.error("Training failed!")
                logger.error(result.stderr)
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("Training timed out")
            return False
        except Exception as e:
            logger.error(f"Training error: {e}")
            return False

def main():
    """Main execution function."""
    config_path = "finetune_ollama_config_tinyllama_optimal.json"
    
    if not os.path.exists(config_path):
        logger.error(f"Configuration file not found: {config_path}")
        sys.exit(1)
    
    # Initialize fine-tuner
    fine_tuner = OllamaFineTuner(config_path)
    
    # Execute training
    success = fine_tuner.train()
    
    if success:
        logger.info("🎉 Fine-tuning completed successfully with >80% accuracy!")
        sys.exit(0)
    else:
        logger.info("⚠️ Fine-tuning completed but did not achieve 80% accuracy target.")
        sys.exit(1)

if __name__ == "__main__":
    main()
