#!/usr/bin/env python3
"""
Model Evaluation Script for PressCrafters Q&A

This script systematically tests all available fine-tuned models
and measures their accuracy against the ground truth dataset.
"""

import json
import subprocess
import time
from typing import Dict, List, Tuple
import re

# Test questions with ground truth answers
TEST_QUESTIONS = [
    {
        "question": "Why is the absence of Greta particularly felt?",
        "ground_truth": "due to her expertise in maintenance",
        "category": "Reasoning",
        "difficulty": "Medium"
    },
    {
        "question": "What is Maria's role at PressCrafters?",
        "ground_truth": "special projects coordinator",
        "category": "factual comprehension",
        "difficulty": "easy"
    },
    {
        "question": "How many active contracts does PressCrafters have?",
        "ground_truth": "23",
        "category": "summary",
        "difficulty": "medium"
    },
    {
        "question": "Which printing machine has broken down and needs repair?",
        "ground_truth": "Atlas",
        "category": "general",
        "difficulty": "medium"
    },
    {
        "question": "What tool does Maria use to track dependencies, deadlines, and machine assignments?",
        "ground_truth": "A massive Gantt chart",
        "category": "general",
        "difficulty": "medium"
    },
    {
        "question": "Who is helping with folding programs by hand?",
        "ground_truth": "Samira",
        "category": "chunk content",
        "difficulty": "medium"
    },
    {
        "question": "What type of project is Marko currently leading, despite his inexperience?",
        "ground_truth": "A wedding invitation run",
        "category": "Chunk Content",
        "difficulty": "Hard"
    },
    {
        "question": "What is PressCrafters Printing Co.'s main challenge at present?",
        "ground_truth": "Machine maintenance and staff absences",
        "category": "Main Idea",
        "difficulty": "Easy"
    }
]


def run_ollama_query(model_name: str, question: str) -> str:
    """Run a query using Ollama and return the response."""
    try:
        # Add a small delay to avoid overwhelming the system
        time.sleep(0.5)

        result = subprocess.run([
            "ollama", "run", model_name, question
        ], capture_output=True, text=True, timeout=30)

        if result.returncode == 0:
            return result.stdout.strip()
        else:
            return f"ERROR: {result.stderr.strip()}"
    except subprocess.TimeoutExpired:
        return "ERROR: Timeout"
    except Exception as e:
        return f"ERROR: {str(e)}"


def calculate_similarity(response: str, ground_truth: str) -> float:
    """Calculate similarity between response and ground truth."""
    if not response or response.startswith("ERROR"):
        return 0.0

    # Convert to lowercase for comparison
    response_lower = response.lower().strip()
    ground_truth_lower = ground_truth.lower().strip()

    # Exact match
    if response_lower == ground_truth_lower:
        return 1.0

    # Check if ground truth is contained in response
    if ground_truth_lower in response_lower:
        return 0.9

    # Check if response contains key words from ground truth
    ground_words = set(ground_truth_lower.split())
    response_words = set(response_lower.split())

    if ground_words:
        word_overlap = len(ground_words.intersection(response_words))
        return word_overlap / len(ground_words)

    return 0.0


def evaluate_model(model_name: str) -> Dict:
    """Evaluate a single model with all test questions."""
    print(f"\n🔍 Evaluating model: {model_name}")
    print("-" * 60)

    results = []
    total_score = 0.0

    for i, test_case in enumerate(TEST_QUESTIONS, 1):
        question = test_case["question"]
        ground_truth = test_case["ground_truth"]
        category = test_case["category"]
        difficulty = test_case["difficulty"]

        print(f"\nQuestion {i}: {question}")
        print(f"Ground Truth: {ground_truth}")
        print(f"Category: {category}, Difficulty: {difficulty}")

        # Get model response
        response = run_ollama_query(model_name, question)
        print(f"Model Response: {response}")

        # Calculate similarity score
        similarity = calculate_similarity(response, ground_truth)
        total_score += similarity

        result = {
            "question": question,
            "ground_truth": ground_truth,
            "response": response,
            "similarity": similarity,
            "category": category,
            "difficulty": difficulty
        }
        results.append(result)

        print(f"Similarity Score: {similarity:.2f}")

        # Add delay between questions
        time.sleep(1)

    average_score = total_score / len(TEST_QUESTIONS)

    print(f"\n📊 Overall Results for {model_name}")
    print("=" * 60)
    print(f"Average Similarity Score: {average_score:.2f}")
    print(f"Total Score: {total_score:.2f}/{len(TEST_QUESTIONS)}")

    return {
        "model_name": model_name,
        "results": results,
        "average_score": average_score,
        "total_score": total_score,
        "total_questions": len(TEST_QUESTIONS)
    }


def print_evaluation_summary(all_results: List[Dict]):
    """Print a summary of all model evaluations."""
    print("\n" + "=" * 80)
    print("FINAL EVALUATION SUMMARY")
    print("=" * 80)

    # Sort models by performance
    sorted_results = sorted(
        all_results, key=lambda x: x["average_score"], reverse=True)

    print("\n🏆 MODEL PERFORMANCE RANKING")
    print("-" * 60)

    for i, result in enumerate(sorted_results, 1):
        model_name = result["model_name"]
        avg_score = result["average_score"]
        total_score = result["total_score"]
        total_questions = result["total_questions"]

        print(f"{i:2d}. {model_name:35s} | Score: {avg_score:.2f} | Total: {total_score:.1f}/{total_questions}")

    print("\n📈 DETAILED ANALYSIS")
    print("-" * 60)

    for result in sorted_results:
        model_name = result["model_name"]
        avg_score = result["average_score"]

        print(f"\n{model_name}:")

        # Categorize performance
        if avg_score >= 0.8:
            performance = "EXCELLENT"
        elif avg_score >= 0.6:
            performance = "GOOD"
        elif avg_score >= 0.4:
            performance = "FAIR"
        elif avg_score >= 0.2:
            performance = "POOR"
        else:
            performance = "VERY POOR"

        print(f"  Performance: {performance}")
        print(f"  Average Score: {avg_score:.2f}")

        # Show best and worst responses
        results = result["results"]
        best_response = max(results, key=lambda x: x["similarity"])
        worst_response = min(results, key=lambda x: x["similarity"])

        print(
            f"  Best Response: {best_response['question'][:50]}... (Score: {best_response['similarity']:.2f})")
        print(
            f"  Worst Response: {worst_response['question'][:50]}... (Score: {worst_response['similarity']:.2f})")


def main():
    """Main evaluation function."""
    print("🚀 PressCrafters Q&A Model Evaluation")
    print("=" * 60)
    print("This script will evaluate all available fine-tuned models")
    print("against the ground truth dataset.")

    # Models to evaluate (based on what we saw in ollama list)
    models_to_evaluate = [
        "phi3-mini-verlag-qa-original",
        "phi3-mini-verlag-qa-original2",
        "phi3-mini-verlag-qa-enhanced",
        "phi3-mini-verlag-qa-memorization",
        "phi3-mini-verlag-qa-v3-memorized",
        "phi3-presscrafter-expert",
        "qwen2.5-coder-7b-verlag"
    ]

    print(f"\n📋 Models to evaluate: {len(models_to_evaluate)}")
    for model in models_to_evaluate:
        print(f"  - {model}")

    print("\n⏳ Starting evaluation...")
    print("Note: This may take several minutes due to model loading times.")

    all_results = []

    for model in models_to_evaluate:
        try:
            result = evaluate_model(model)
            all_results.append(result)
        except Exception as e:
            print(f"❌ Error evaluating {model}: {str(e)}")
            continue

    if all_results:
        print_evaluation_summary(all_results)

        # Save results to file
        output_file = "model_evaluation_results.json"
        with open(output_file, 'w') as f:
            json.dump(all_results, f, indent=2)
        print(f"\n💾 Results saved to: {output_file}")
    else:
        print("\n❌ No models were successfully evaluated.")


if __name__ == "__main__":
    main()
