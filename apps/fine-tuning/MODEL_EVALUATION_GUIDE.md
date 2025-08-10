# 📊 Model Performance Evaluation Guide

This guide provides comprehensive instructions for evaluating fine-tuned language model performance using automated testing, metrics analysis, and continuous improvement strategies.

## 🎯 Table of Contents

1. [Quick Start](#-quick-start)
2. [Evaluation Methodology](#-evaluation-methodology)
3. [Using the Evaluation Script](#-using-the-evaluation-script)
4. [Understanding Metrics](#-understanding-metrics)
5. [Interpreting Results](#-interpreting-results)
6. [Best Practices](#-best-practices)
7. [Troubleshooting](#-troubleshooting)
8. [Advanced Techniques](#-advanced-techniques)

---

## 🚀 Quick Start

### Prerequisites

- Fine-tuned model registered in Ollama
- Test dataset in JSONL format
- Python 3.7+ with required dependencies

### Basic Evaluation

```bash
# Evaluate your fine-tuned model against baseline
python3 evaluate_performance.py \
  --finetuned-model your-model-name \
  --baseline-model qwen2.5-coder:7b \
  --num-samples 30

# Example with your specific model
python3 evaluate_performance.py \
  --finetuned-model qwen2.5-coder-7b-verlag \
  --baseline-model qwen2.5-coder:7b \
  --num-samples 50
```

### Quick Results Interpretation

- **Green (🟢)**: +0.2+ improvement = Excellent
- **Yellow (🟡)**: +0.1-0.2 improvement = Good
- **Orange (🟠)**: +0.0-0.1 improvement = Needs optimization
- **Red (🔴)**: Negative improvement = Major issues

---

## 🔬 Evaluation Methodology

### Overview

Our evaluation approach uses **comparative analysis** between baseline and fine-tuned models:

```
Ground Truth Questions → Baseline Model → Response A
                     ↘ Fine-tuned Model → Response B
                     
Compare A vs B against ground truth to measure improvement
```

### Key Principles

1. **Same Test Set**: Both models tested on identical questions
2. **Randomized Sampling**: Questions randomly selected to avoid bias
3. **Multi-dimensional Analysis**: Multiple metrics for comprehensive view
4. **Categorical Breakdown**: Performance by difficulty and category
5. **Actionable Insights**: Specific recommendations for improvement

---

## 🛠 Using the Evaluation Script

### Basic Usage

```bash
python3 evaluate_performance.py [OPTIONS]
```

### Command Line Options

| Option | Default | Description |
|--------|---------|-------------|
| `--finetuned-model` | `qwen2.5-coder-7b-verlag` | Name of fine-tuned model in Ollama |
| `--baseline-model` | `qwen2.5-coder:7b` | Name of baseline model for comparison |
| `--dataset` | `jsonl/raw/qa-data.jsonl` | Path to test dataset |
| `--num-samples` | `30` | Number of questions to test |
| `--output-dir` | `evaluation_results` | Directory to save results |

### Example Commands

```bash
# Quick evaluation with 20 samples
python3 evaluate_performance.py --num-samples 20

# Comprehensive evaluation with custom models
python3 evaluate_performance.py \
  --finetuned-model llama-7b-custom \
  --baseline-model llama2:7b \
  --num-samples 100 \
  --output-dir results_$(date +%Y%m%d)

# Domain-specific evaluation
python3 evaluate_performance.py \
  --dataset domain_specific_questions.jsonl \
  --num-samples 50
```

### Expected Output

```
🔍 Starting Fine-tuned Model Performance Evaluation
Fine-tuned Model: qwen2.5-coder-7b-verlag
Baseline Model: qwen2.5-coder:7b
Dataset: jsonl/raw/qa-data.jsonl
Test Samples: 30

📊 Loaded 30 test questions

==================================================
🔍 Evaluating Baseline Model...
📝 Question 1/30: What is the name of the printing...
[... evaluation progress ...]

✅ Evaluation Complete!
📊 Summary:
- Baseline Accuracy: 0.156
- Fine-tuned Accuracy: 0.234
- Improvement: +0.078

📁 Results saved to:
- Raw data: evaluation_results/evaluation_results_20250809_143022.json
- Report: evaluation_results/performance_report_20250809_143022.md
```

---

## 📈 Understanding Metrics

### Primary Metrics

#### 1. **Average Similarity Score** (0.0 - 1.0)
- **Perfect Match (1.0)**: Exact string match with ground truth
- **High Similarity (0.7-0.9)**: Ground truth contained in response
- **Moderate Similarity (0.3-0.7)**: Partial word overlap
- **Low Similarity (0.0-0.3)**: Minimal or no overlap

```python
# How similarity is calculated:
def calculate_similarity(ground_truth: str, response: str) -> float:
    # 1. Exact match → 1.0
    # 2. Contains ground truth → 0.8
    # 3. Word overlap ratio → 0.0-1.0
    return similarity_score
```

#### 2. **Perfect Matches** (Count/Percentage)
Number of responses that exactly match ground truth

#### 3. **Good Matches** (Count/Percentage)  
Number of responses with ≥70% similarity

#### 4. **Error Rate**
Responses containing error messages or timeouts

### Performance Categories

#### By Difficulty Level
- **Easy**: Simple factual questions
- **Medium**: Multi-step reasoning required
- **Hard**: Complex analysis or inference

#### By Question Category
- **Factual Detail**: Specific facts from source material
- **Character Details**: Information about people/roles
- **General Knowledge**: Broad understanding questions
- **Context-aware**: Questions requiring domain knowledge

---

## 🔍 Interpreting Results

### Performance Report Structure

```markdown
# 📊 Fine-tuned Model Performance Evaluation Report

## 📈 Overall Performance Comparison
[Baseline vs Fine-tuned metrics table]

## 🎯 Performance by Question Difficulty  
[Breakdown by Easy/Medium/Hard]

## 🔍 Detailed Analysis
### Best Improvements
[Examples where fine-tuned > baseline]

### Areas Needing Improvement
[Examples where baseline > fine-tuned]

# 🚀 Improvement Recommendations
[Specific actionable recommendations]
```

### What Good Results Look Like

```
✅ Excellent Performance Indicators:
- Average Similarity: 0.4+ (40%+)
- Perfect Matches: 15%+ 
- Good Matches: 30%+
- Consistent improvement across difficulties
- Low error rate (<5%)

🟡 Acceptable Performance:
- Average Similarity: 0.2-0.4 (20-40%)
- Perfect Matches: 5-15%
- Good Matches: 15-30%
- Some category improvements

🔴 Poor Performance (Needs Work):
- Average Similarity: <0.2 (<20%)
- Perfect Matches: <5%
- Good Matches: <15%
- High error rate (>10%)
```

### Red Flags to Watch For

❌ **Critical Issues:**
- **Negative improvement**: Fine-tuned worse than baseline
- **High error rate**: Model producing errors/timeouts
- **Catastrophic forgetting**: Sharp decline in basic capabilities
- **Overfitting signs**: Perfect training, poor validation

⚠️ **Warning Signs:**
- **Inconsistent performance**: Good on easy, terrible on hard
- **Single-category focus**: Improvement only in one area
- **Verbose responses**: Model giving long, unfocused answers
- **Domain drift**: Model losing general knowledge

---

## 🎯 Best Practices

### 1. Evaluation Frequency

```bash
# During development (frequent, small samples)
python3 evaluate_performance.py --num-samples 10

# Pre-deployment (comprehensive)
python3 evaluate_performance.py --num-samples 100

# Production monitoring (scheduled)
0 6 * * 1 cd /path/to/fine-tuning && python3 evaluate_performance.py --num-samples 50
```

### 2. Test Set Management

#### Creating Good Test Sets

```jsonl
// ✅ Good test example
{"prompt": "How many printing machines does PressCrafters have?", "completion": "Three: Titan, Pegasus, and Atlas", "difficulty": "Easy", "category": "Factual Detail"}

// ❌ Poor test example  
{"prompt": "What?", "completion": "Yes", "difficulty": "Unknown", "category": "None"}
```

#### Test Set Guidelines

- **Size**: 50-200 questions for development, 500+ for production
- **Balance**: Equal distribution across difficulties and categories
- **Quality**: Clear questions with unambiguous answers
- **Coverage**: Representative of real-world use cases
- **Freshness**: Regular updates to prevent test set overfitting

### 3. Baseline Selection

```bash
# Choose appropriate baselines:

# Same model family (recommended)
--baseline-model qwen2.5-coder:7b

# Different model family (for comparison)
--baseline-model llama2:7b

# Previous version (for version comparison)
--baseline-model your-model-v1
```

### 4. Sample Size Guidelines

| Use Case | Sample Size | Rationale |
|----------|-------------|-----------|
| Quick development check | 10-20 | Fast feedback during iteration |
| Feature evaluation | 30-50 | Balance between speed and reliability |
| Pre-deployment validation | 100+ | Confidence for production deployment |
| A/B testing | 200+ | Statistical significance |
| Production monitoring | 50-100 | Regular performance tracking |

### 5. Reproducible Evaluation

```bash
# Use consistent random seed
export PYTHONHASHSEED=42
python3 evaluate_performance.py --num-samples 50

# Version control your test sets
git add jsonl/raw/qa-data.jsonl
git commit -m "Add test set v1.2 - fixed ambiguous questions"

# Document evaluation settings
echo "Evaluation performed with Ollama v$(ollama --version)" >> evaluation_log.txt
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **Model Not Found**
```
Error: Model 'your-model' not found
```

**Solution:**
```bash
# Check available models
ollama list

# Pull missing baseline model
ollama pull qwen2.5-coder:7b

# Verify your fine-tuned model exists
ollama run your-model "test"
```

#### 2. **Low Performance Despite Training**
```
Baseline: 0.15, Fine-tuned: 0.16 (+0.01)
```

**Diagnosis Steps:**
```bash
# 1. Check training logs
tail -100 your_training.log

# 2. Verify dataset quality
head -20 jsonl/raw/qa-data.jsonl

# 3. Test with more samples
python3 evaluate_performance.py --num-samples 100

# 4. Check individual responses
cat evaluation_results/evaluation_results_*.json | jq '.finetuned.responses[0]'
```

#### 3. **Timeout Errors**
```
📝 Question 5/30: Error: Timeout
```

**Solutions:**
```bash
# Increase timeout
python3 evaluate_performance.py --timeout 60

# Or modify the script:
# In query_ollama_model function, change:
timeout=60  # increased from 30
```

#### 4. **Memory Issues**
```
Error: CUDA out of memory
```

**Solutions:**
```bash
# Reduce sample size
python3 evaluate_performance.py --num-samples 20

# Use smaller models
--baseline-model qwen2.5-coder:3b

# Run with CPU only
CUDA_VISIBLE_DEVICES="" python3 evaluate_performance.py
```

### Performance Debugging

#### Poor Similarity Scores

```python
# Add to evaluation script for debugging:
def debug_similarity(ground_truth, response):
    print(f"Ground Truth: '{ground_truth}'")
    print(f"Response: '{response}'")
    print(f"Similarity: {calculate_similarity(ground_truth, response)}")
    print("---")
```

#### Unexpected Model Behavior

```bash
# Test individual queries manually
ollama run qwen2.5-coder-7b-verlag "How many machines does PressCrafters have?"

# Compare with baseline
ollama run qwen2.5-coder:7b "How many machines does PressCrafters have?"
```

---

## 🚀 Advanced Techniques

### 1. Custom Similarity Metrics

```python
# Add semantic similarity using embeddings
from sentence_transformers import SentenceTransformer

def semantic_similarity(text1: str, text2: str) -> float:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode([text1, text2])
    return cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
```

### 2. Domain-Specific Evaluation

```python
# Create domain-specific test sets
def create_domain_tests():
    return [
        {
            "prompt": "What printing technology does PressCrafters use?",
            "completion": "Offset printing with digital workflow",
            "domain": "printing_industry",
            "importance": "high"
        }
    ]
```

### 3. Automated A/B Testing

```bash
#!/bin/bash
# compare_models.sh

for model in model-v1 model-v2 model-v3; do
    echo "Testing $model..."
    python3 evaluate_performance.py \
        --finetuned-model $model \
        --num-samples 100 \
        --output-dir "results_$model"
done

# Generate comparison report
python3 compare_evaluations.py results_*/
```

### 4. Continuous Evaluation Pipeline

```yaml
# .github/workflows/model-evaluation.yml
name: Model Performance Evaluation
on:
  schedule:
    - cron: '0 6 * * 1'  # Every Monday at 6 AM
  
jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install Ollama
        run: curl -fsSL https://ollama.ai/install.sh | sh
      - name: Run Evaluation
        run: |
          python3 evaluate_performance.py --num-samples 100
      - name: Upload Results
        uses: actions/upload-artifact@v2
        with:
          name: evaluation-results
          path: evaluation_results/
```

### 5. Human Evaluation Integration

```python
# human_eval.py
def collect_human_ratings():
    """Collect human ratings for model responses"""
    # Integration with annotation platforms
    # - Label Studio
    # - Prodigy
    # - Custom web interface
    pass

def correlate_human_automated():
    """Compare human ratings with automated metrics"""
    # Validate that automated metrics align with human judgment
    pass
```

---

## 📚 Additional Resources

### Related Documentation
- [Data Preparation Guide](Data_Prep.md)
- [Fine-tuning Configuration](FINE_TUNING_README.md)
- [Ollama Integration](FINE-TUNE-TO-OLLAMA.md)

### Useful Commands Reference

```bash
# Model management
ollama list                    # List available models
ollama pull model:tag         # Download model
ollama rm model:tag           # Remove model
ollama run model "prompt"     # Test model manually

# Evaluation shortcuts
alias eval-quick='python3 evaluate_performance.py --num-samples 20'
alias eval-full='python3 evaluate_performance.py --num-samples 100'

# Results analysis
jq '.finetuned.avg_similarity' evaluation_results/evaluation_results_*.json
jq '.baseline.perfect_matches, .finetuned.perfect_matches' evaluation_results/evaluation_results_*.json
```

### Performance Benchmarks

| Model Type | Expected Similarity | Perfect Matches | Notes |
|------------|-------------------|-----------------|-------|
| Domain-specific | 0.4-0.7 | 10-30% | Well-tuned for specific domain |
| General-purpose | 0.2-0.4 | 5-15% | Broad knowledge, less specific |
| Code-specialized | 0.3-0.6 | 15-25% | Good for technical questions |
| Conversation | 0.1-0.3 | 2-10% | Focuses on style over facts |

---

## 💡 Tips for Success

### 🎯 **Before Evaluation**
- Ensure test set represents real use cases
- Verify both models are properly loaded
- Check dataset format and quality
- Plan evaluation frequency

### 📊 **During Evaluation** 
- Monitor progress for timeouts/errors
- Sample individual responses for quality check
- Note any unusual patterns in output
- Compare response styles between models

### 📈 **After Evaluation**
- Analyze categorical performance differences
- Identify specific improvement areas
- Plan next training iteration based on results
- Document findings for team sharing

### 🔄 **Continuous Improvement**
- Regular evaluation schedule (weekly/monthly)
- Version control evaluation results
- Track improvement trends over time
- Correlate with real-world performance metrics

---

*This guide provides a comprehensive framework for evaluating fine-tuned language models. Regular evaluation ensures your models maintain high quality and continue improving over time.*
