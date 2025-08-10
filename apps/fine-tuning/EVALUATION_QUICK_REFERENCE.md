# 📋 Model Evaluation Quick Reference

## 🚀 Essential Commands

### Basic Evaluation
```bash
# Quick test (20 samples)
python3 evaluate_performance.py --num-samples 20

# Standard evaluation (30 samples)  
python3 evaluate_performance.py

# Comprehensive test (100 samples)
python3 evaluate_performance.py --num-samples 100
```

### Custom Models
```bash
# Evaluate your specific model
python3 evaluate_performance.py \
  --finetuned-model your-model-name \
  --baseline-model qwen2.5-coder:7b

# Compare different models
python3 evaluate_performance.py \
  --finetuned-model model-v2 \
  --baseline-model model-v1
```

### Custom Dataset
```bash
# Use different test dataset
python3 evaluate_performance.py \
  --dataset path/to/your/test-data.jsonl \
  --num-samples 50
```

## 📊 Understanding Results

### Performance Levels
| Score | Quality | Action Needed |
|-------|---------|---------------|
| 0.4+ | 🟢 Excellent | Deploy with confidence |
| 0.2-0.4 | 🟡 Good | Minor optimizations |
| 0.1-0.2 | 🟠 Needs work | Major improvements needed |
| <0.1 | 🔴 Poor | Restart training process |

### Key Metrics
- **Average Similarity**: Overall model accuracy (0.0-1.0)
- **Perfect Matches**: Exact correct answers (%)
- **Good Matches**: Mostly correct answers ≥70% (%)
- **Improvement**: Fine-tuned vs baseline difference

## 🔧 Troubleshooting

### Model Not Found
```bash
# Check available models
ollama list

# Pull missing model  
ollama pull qwen2.5-coder:7b
```

### Low Performance
```bash
# Test with more samples
python3 evaluate_performance.py --num-samples 100

# Check individual responses
cat evaluation_results/evaluation_results_*.json | head -50
```

### Timeout Issues
```bash
# Increase timeout (edit script)
# Change timeout=30 to timeout=60 in query_ollama_model()
```

## 📁 Output Files

### Results Location
```
evaluation_results/
├── evaluation_results_YYYYMMDD_HHMMSS.json  # Raw data
└── performance_report_YYYYMMDD_HHMMSS.md    # Detailed report
```

### Quick Analysis
```bash
# View latest similarity scores
ls -t evaluation_results/*.json | head -1 | xargs jq '.baseline.avg_similarity, .finetuned.avg_similarity'

# Count perfect matches
ls -t evaluation_results/*.json | head -1 | xargs jq '.finetuned.perfect_matches'
```

## 🎯 Best Practices

### Sample Sizes
- **Development**: 10-20 samples (fast feedback)
- **Validation**: 30-50 samples (balanced testing)  
- **Production**: 100+ samples (comprehensive)

### Evaluation Frequency
- **During training**: After each major config change
- **Pre-deployment**: Full evaluation before release
- **Production**: Weekly/monthly monitoring

### Result Interpretation
- Focus on **improvement trends** over absolute scores
- Check **category-specific** performance (Easy/Medium/Hard)
- Monitor for **regressions** in any area
- Compare **error rates** between models

---

*For detailed documentation, see [MODEL_EVALUATION_GUIDE.md](MODEL_EVALUATION_GUIDE.md)*
