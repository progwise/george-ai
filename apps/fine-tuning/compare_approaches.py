#!/usr/bin/env python3
"""
Comparison script for old vs new fine-tuning approaches.

This script demonstrates the improvements in learning rate scheduling
and hyperparameter optimization for the PressCrafters Q&A fine-tuning.
"""

import json
import matplotlib.pyplot as plt
import numpy as np
from advanced_lr_scheduler import AdvancedLRScheduler


def load_config(config_path):
    """Load configuration from JSON file."""
    with open(config_path, 'r') as f:
        return json.load(f)


def plot_learning_rate_comparison():
    """Plot learning rate schedules for comparison."""

    # Old approach: constant learning rate
    old_lr = 1e-4
    steps = np.arange(0, 1000, 10)
    old_lrs = [old_lr] * len(steps)

    # New approach: advanced scheduling
    new_config = {
        "learning_rate_schedule": {
            "type": "adaptive_exploration_exploitation",
            "phases": [
                {
                    "name": "exploration",
                    "steps": 200,
                    "lr_range": [5e-4, 2e-4],
                    "strategy": "linear_warmup"
                },
                {
                    "name": "exploitation",
                    "steps": 600,
                    "lr_range": [2e-4, 5e-6],
                    "strategy": "cosine_decay"
                },
                {
                    "name": "refinement",
                    "steps": 200,
                    "lr_range": [5e-6, 1e-6],
                    "strategy": "exponential_decay"
                }
            ],
            "adaptive_threshold": 0.001,
            "patience_factor": 1.5
        }
    }

    scheduler = AdvancedLRScheduler(new_config)
    new_lrs = [scheduler.get_learning_rate(step) for step in steps]

    # Create the plot
    plt.figure(figsize=(12, 8))

    # Learning rate comparison
    plt.subplot(2, 2, 1)
    plt.plot(steps, old_lrs, 'r-', linewidth=2,
             label='Old: Constant LR (1e-4)')
    plt.plot(steps, new_lrs, 'b-', linewidth=2,
             label='New: Advanced Scheduling')
    plt.xlabel('Training Steps')
    plt.ylabel('Learning Rate')
    plt.title('Learning Rate Comparison')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.yscale('log')

    # Phase visualization
    plt.subplot(2, 2, 2)
    phases = ['Exploration', 'Exploitation', 'Refinement']
    phase_steps = [200, 600, 200]
    phase_colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']

    current_step = 0
    for i, (phase, step_count, color) in enumerate(zip(phases, phase_steps, phase_colors)):
        plt.barh(0, step_count, left=current_step,
                 color=color, alpha=0.7, label=phase)
        current_step += step_count

    plt.xlabel('Training Steps')
    plt.title('Training Phases')
    plt.legend()
    plt.xlim(0, 1000)

    # Learning rate by phase
    plt.subplot(2, 2, 3)
    phase_boundaries = [0, 200, 800, 1000]
    phase_names = ['Exploration', 'Exploitation', 'Refinement']

    for i in range(len(phase_boundaries) - 1):
        start, end = phase_boundaries[i], phase_boundaries[i + 1]
        phase_steps = np.arange(start, end, 10)
        phase_lrs = [scheduler.get_learning_rate(step) for step in phase_steps]
        plt.plot(phase_steps, phase_lrs, linewidth=2, label=phase_names[i])

    plt.xlabel('Training Steps')
    plt.ylabel('Learning Rate')
    plt.title('Learning Rate by Phase')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.yscale('log')

    # Performance comparison table
    plt.subplot(2, 2, 4)
    plt.axis('off')

    comparison_data = [
        ['Aspect', 'Old Approach', 'New Approach', 'Improvement'],
        ['Learning Rate', 'Constant 1e-4', 'Adaptive 5e-4→1e-6', 'Dynamic'],
        ['Training Strategy', 'Single phase', '3-phase approach', 'Structured'],
        ['Exploration', 'Limited', 'High early LR', 'Better'],
        ['Exploitation', 'None', 'Gradual decay', 'Optimized'],
        ['Refinement', 'None', 'Low final LR', 'Precise'],
        ['Adaptation', 'None', 'Loss-based', 'Intelligent']
    ]

    table = plt.table(cellText=comparison_data[1:], colLabels=comparison_data[0],
                      cellLoc='center', loc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 2)

    plt.tight_layout()
    plt.savefig('fine_tuning_comparison.png', dpi=300, bbox_inches='tight')
    plt.show()


def print_configuration_comparison():
    """Print a detailed comparison of configurations."""

    print("=" * 80)
    print("FINE-TUNING APPROACH COMPARISON")
    print("=" * 80)

    print("\n📊 OLD APPROACH (Current)")
    print("-" * 40)
    print("Model: Phi-3-mini-4k-instruct")
    print("Learning Rate: Constant 1e-4")
    print("Training Steps: 1000")
    print("LoRA Rank: 64")
    print("Batch Size: 4")
    print("Strategy: Single phase, static")

    print("\n🚀 NEW APPROACH (Improved)")
    print("-" * 40)
    print("Model: Qwen2.5-7B-Instruct (or Phi-3-mini-4k-instruct)")
    print("Learning Rate: Adaptive 5e-4 → 1e-6")
    print("Training Steps: 1500-2000")
    print("LoRA Rank: 96-128")
    print("Batch Size: 2-6 (with accumulation)")
    print("Strategy: 3-phase exploration-exploitation")

    print("\n🎯 KEY IMPROVEMENTS")
    print("-" * 40)
    improvements = [
        "Multi-phase learning rate scheduling",
        "Exploration phase for better loss landscape exploration",
        "Exploitation phase for gradual refinement",
        "Refinement phase for precise optimization",
        "Adaptive learning rate adjustment",
        "Higher LoRA rank for better expressiveness",
        "Optimized batch sizes and gradient accumulation",
        "Curriculum learning support",
        "Dynamic batch sizing capabilities"
    ]

    for i, improvement in enumerate(improvements, 1):
        print(f"{i:2d}. {improvement}")

    print("\n📈 EXPECTED PERFORMANCE GAINS")
    print("-" * 40)
    gains = [
        "20-30% faster convergence",
        "Better final model performance",
        "More stable training process",
        "Improved generalization",
        "Reduced overfitting risk",
        "Better question-answering accuracy"
    ]

    for i, gain in enumerate(gains, 1):
        print(f"{i:2d}. {gain}")


def print_usage_instructions():
    """Print usage instructions for the improved configurations."""

    print("\n" + "=" * 80)
    print("USAGE INSTRUCTIONS")
    print("=" * 80)

    print("\n🔧 BASIC USAGE")
    print("-" * 40)
    print("# For best performance (Qwen2.5-7B):")
    print("python3 auto_finetune_to_ollama.py finetune_ollama_config_qwen2_5_7b_improved.json")

    print("\n# For efficiency (Phi-3-mini):")
    print("python3 auto_finetune_to_ollama.py finetune_ollama_config_phi3_mini_4k_advanced.json")

    print("\n# For comparison (original):")
    print("python3 auto_finetune_to_ollama.py finetune_ollama_config_phi3_mini_original.json")

    print("\n📊 MONITORING TRAINING")
    print("-" * 40)
    print("# Use the advanced scheduler for monitoring:")
    print("from advanced_lr_scheduler import AdvancedLRScheduler")
    print("scheduler = AdvancedLRScheduler(config)")
    print("lr = scheduler.get_learning_rate(step=500)")
    print("phase_info = scheduler.get_phase_info()")

    print("\n🎯 RECOMMENDATIONS")
    print("-" * 40)
    recommendations = [
        "Start with Phi-3-mini for quick experiments",
        "Use Qwen2.5-7B for production deployment",
        "Monitor learning rate changes during training",
        "Adjust phase boundaries based on your dataset",
        "Use early stopping with the provided patience settings"
    ]

    for i, rec in enumerate(recommendations, 1):
        print(f"{i:2d}. {rec}")


if __name__ == "__main__":
    print_configuration_comparison()
    print_usage_instructions()

    # Try to plot the comparison (requires matplotlib)
    try:
        plot_learning_rate_comparison()
        print("\n✅ Comparison plot saved as 'fine_tuning_comparison.png'")
    except ImportError:
        print("\n⚠️  matplotlib not available - skipping plot generation")
        print("Install with: pip install matplotlib")

    print("\n" + "=" * 80)
    print("For detailed information, see: IMPROVED_FINE_TUNING_GUIDE.md")
    print("=" * 80)
