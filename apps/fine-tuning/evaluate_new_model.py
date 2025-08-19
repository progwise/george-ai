#!/usr/bin/env python3
"""
Quick evaluation of the new fine-tuned model: phi3-mini-presscrafters-expert
"""

import subprocess
import time

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
        time.sleep(0.5)  # Small delay

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


def evaluate_new_model():
    """Evaluate the new fine-tuned model."""
    model_name = "phi3-mini-presscrafters-expert"

    print(f"🚀 Evaluating NEW MODEL: {model_name}")
    print("=" * 60)

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

        results.append({
            "question": question,
            "ground_truth": ground_truth,
            "response": response,
            "similarity": similarity,
            "category": category,
            "difficulty": difficulty
        })

        print(f"Similarity Score: {similarity:.2f}")

        time.sleep(1)  # Delay between questions

    average_score = total_score / len(TEST_QUESTIONS)

    print(f"\n📊 FINAL RESULTS for {model_name}")
    print("=" * 60)
    print(f"Average Similarity Score: {average_score:.2f}")
    print(f"Total Score: {total_score:.2f}/{len(TEST_QUESTIONS)}")

    # Performance categorization
    if average_score >= 0.8:
        performance = "EXCELLENT 🎉"
    elif average_score >= 0.6:
        performance = "GOOD 👍"
    elif average_score >= 0.4:
        performance = "FAIR 🤔"
    elif average_score >= 0.2:
        performance = "POOR 👎"
    else:
        performance = "VERY POOR ❌"

    print(f"Overall Performance: {performance}")

    # Show best and worst responses
    best_response = max(results, key=lambda x: x["similarity"])
    worst_response = min(results, key=lambda x: x["similarity"])

    print(
        f"\n🏆 Best Response: {best_response['question'][:50]}... (Score: {best_response['similarity']:.2f})")
    print(
        f"❌ Worst Response: {worst_response['question'][:50]}... (Score: {worst_response['similarity']:.2f})")

    return results, average_score


if __name__ == "__main__":
    evaluate_new_model()
