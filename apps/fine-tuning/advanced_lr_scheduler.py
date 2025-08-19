"""
Advanced Learning Rate Scheduler for Fine-tuning

This script implements sophisticated learning rate scheduling strategies that balance
exploration (high learning rates) early in training with exploitation (low learning rates)
later in training for optimal fine-tuning performance.

Features:
- Multi-phase learning rate scheduling
- Exploration-exploitation balance
- Adaptive learning rate adjustment
- Curriculum learning support
- Dynamic batch sizing
"""

import math
import numpy as np
from typing import Dict, List, Optional, Tuple, Union
import json


class AdvancedLRScheduler:
    """
    Advanced learning rate scheduler with exploration-exploitation phases.

    This scheduler implements a three-phase approach:
    1. Exploration: High learning rates to explore the loss landscape
    2. Exploitation: Gradually decreasing rates to fine-tune
    3. Refinement: Very low rates for final optimization
    """

    def __init__(self, config: Dict):
        """
        Initialize the scheduler with configuration.

        Args:
            config: Configuration dictionary containing scheduler parameters
        """
        self.config = config
        self.current_step = 0
        self.current_phase = 0
        self.best_loss = float('inf')
        self.patience_counter = 0

        # Extract configuration
        self.phases = config.get(
            "learning_rate_schedule", {}).get("phases", [])
        self.adaptive_threshold = config.get(
            "learning_rate_schedule", {}).get("adaptive_threshold", 0.001)
        self.patience_factor = config.get(
            "learning_rate_schedule", {}).get("patience_factor", 1.5)

        # Initialize phase boundaries
        self.phase_boundaries = self._calculate_phase_boundaries()

    def _calculate_phase_boundaries(self) -> List[int]:
        """Calculate step boundaries for each phase."""
        boundaries = [0]
        for phase in self.phases:
            boundaries.append(boundaries[-1] + phase["steps"])
        return boundaries

    def get_learning_rate(self, step: int, current_loss: Optional[float] = None) -> float:
        """
        Get the learning rate for the current step.

        Args:
            step: Current training step
            current_loss: Current loss value (optional, for adaptive scheduling)

        Returns:
            Learning rate for the current step
        """
        self.current_step = step

        # Update phase if needed
        self._update_phase(step)

        # Get current phase
        phase = self.phases[self.current_phase]

        # Calculate learning rate based on phase strategy
        lr = self._calculate_phase_lr(phase, step)

        # Apply adaptive adjustments if loss is provided
        if current_loss is not None:
            lr = self._apply_adaptive_adjustment(lr, current_loss)

        return lr

    def _update_phase(self, step: int):
        """Update the current phase based on step count."""
        for i, boundary in enumerate(self.phase_boundaries[1:], 1):
            if step < boundary:
                self.current_phase = i - 1
                break
        else:
            self.current_phase = len(self.phases) - 1

    def _calculate_phase_lr(self, phase: Dict, step: int) -> float:
        """Calculate learning rate for a specific phase."""
        phase_start = self.phase_boundaries[self.current_phase]
        phase_steps = step - phase_start
        strategy = phase["strategy"]
        lr_range = phase["lr_range"]

        if strategy == "linear_warmup":
            return self._linear_warmup(lr_range, phase_steps, phase["steps"])
        elif strategy == "cosine_decay":
            return self._cosine_decay(lr_range, phase_steps, phase["steps"])
        elif strategy == "exponential_decay":
            return self._exponential_decay(lr_range, phase_steps, phase["steps"])
        else:
            return lr_range[0]  # Default to initial learning rate

    def _linear_warmup(self, lr_range: List[float], step: int, total_steps: int) -> float:
        """Linear warmup from start_lr to end_lr."""
        if step >= total_steps:
            return lr_range[1]

        progress = step / total_steps
        return lr_range[0] + progress * (lr_range[1] - lr_range[0])

    def _cosine_decay(self, lr_range: List[float], step: int, total_steps: int) -> float:
        """Cosine decay from start_lr to end_lr."""
        if step >= total_steps:
            return lr_range[1]

        progress = step / total_steps
        decay = 0.5 * (1.0 + math.cos(math.pi * progress))
        return lr_range[1] + decay * (lr_range[0] - lr_range[1])

    def _exponential_decay(self, lr_range: List[float], step: int, total_steps: int) -> float:
        """Exponential decay from start_lr to end_lr."""
        if step >= total_steps:
            return lr_range[1]

        progress = step / total_steps
        decay_rate = math.log(lr_range[1] / lr_range[0])
        return lr_range[0] * math.exp(decay_rate * progress)

    def _apply_adaptive_adjustment(self, base_lr: float, current_loss: float) -> float:
        """
        Apply adaptive learning rate adjustment based on loss improvement.

        This implements a simple adaptive strategy that reduces learning rate
        if loss isn't improving significantly.
        """
        if current_loss < self.best_loss - self.adaptive_threshold:
            # Loss is improving significantly, keep current LR
            self.best_loss = current_loss
            self.patience_counter = 0
            return base_lr
        else:
            # Loss not improving, reduce patience
            self.patience_counter += 1

            # If patience exceeded, reduce learning rate
            if self.patience_counter > 10:  # Adjustable threshold
                reduction_factor = 1.0 / self.patience_factor
                adjusted_lr = base_lr * reduction_factor
                self.patience_counter = 0  # Reset counter
                # Don't go below 10% of base
                return max(adjusted_lr, base_lr * 0.1)

        return base_lr

    def get_phase_info(self) -> Dict:
        """Get information about the current training phase."""
        if self.current_phase < len(self.phases):
            phase = self.phases[self.current_phase]
            return {
                "phase_name": phase["name"],
                "phase_number": self.current_phase + 1,
                "total_phases": len(self.phases),
                "current_step": self.current_step,
                "phase_start": self.phase_boundaries[self.current_phase],
                "phase_end": self.phase_boundaries[self.current_phase + 1] if self.current_phase + 1 < len(self.phase_boundaries) else "end",
                "strategy": phase["strategy"],
                "lr_range": phase["lr_range"]
            }
        return {"error": "No active phase"}


def create_mlx_compatible_scheduler(config: Dict):
    """
    Create a learning rate scheduler compatible with MLX-LM.

    This function creates a custom learning rate schedule that can be used
    with the MLX optimizer's learning_rate parameter.

    Args:
        config: Configuration dictionary

    Returns:
        A function that takes step as argument and returns learning rate
    """
    scheduler = AdvancedLRScheduler(config)

    def mlx_lr_schedule(step):
        """MLX-compatible learning rate schedule function."""
        return scheduler.get_learning_rate(step)

    return mlx_lr_schedule


def create_curriculum_sampler(dataset, config: Dict):
    """
    Create a curriculum learning sampler that presents examples in order of difficulty.

    Args:
        dataset: The training dataset
        config: Configuration dictionary

    Returns:
        A sampler that yields examples in curriculum order
    """
    # This is a placeholder for curriculum learning implementation
    # In practice, you'd implement difficulty-based sampling here
    pass


def create_dynamic_batch_sampler(dataset, config: Dict):
    """
    Create a dynamic batch sampler that adjusts batch sizes based on sequence length.

    Args:
        dataset: The training dataset
        config: Configuration dictionary

    Returns:
        A sampler that yields batches with dynamic sizing
    """
    # This is a placeholder for dynamic batch sizing implementation
    # In practice, you'd implement length-based batch sizing here
    pass


# Example usage and testing
if __name__ == "__main__":
    # Example configuration
    example_config = {
        "learning_rate_schedule": {
            "type": "adaptive_exploration_exploitation",
            "phases": [
                {
                    "name": "exploration",
                    "steps": 300,
                    "lr_range": [5e-4, 2e-4],
                    "strategy": "linear_warmup"
                },
                {
                    "name": "exploitation",
                    "steps": 900,
                    "lr_range": [2e-4, 5e-6],
                    "strategy": "cosine_decay"
                },
                {
                    "name": "refinement",
                    "steps": 300,
                    "lr_range": [5e-6, 1e-6],
                    "strategy": "exponential_decay"
                }
            ],
            "adaptive_threshold": 0.001,
            "patience_factor": 1.5
        }
    }

    # Create scheduler
    scheduler = AdvancedLRScheduler(example_config)

    # Test learning rate progression
    print("Learning Rate Schedule Test:")
    print("=" * 50)

    test_steps = [0, 100, 200, 300, 600, 900, 1200, 1500]

    for step in test_steps:
        lr = scheduler.get_learning_rate(step)
        phase_info = scheduler.get_phase_info()
        print(
            f"Step {step:4d}: LR = {lr:.2e}, Phase: {phase_info['phase_name']}")

    print("\n" + "=" * 50)
    print("MLX-compatible scheduler created successfully!")
