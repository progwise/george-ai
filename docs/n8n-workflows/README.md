# n8n Workflows for George AI

This folder contains n8n workflow templates for integrating with George AI.

## Available Workflows

### 1. Gmail to George AI

**File:** `gmail-to-george-ai.json`
**Documentation:** [gmail-to-george-ai.md](./gmail-to-george-ai.md)

Automatically ingest Gmail emails and attachments into George AI libraries.

**Features:**

- Automatic polling mode (checks every minute)
- Manual bulk import mode (up to 10 emails at once)
- Duplicate detection
- Full email metadata and attachments

### 2. RAG Chatbot Experiment

**File:** `rag-chatbot-experiment.json`
**Documentation:** [rag-chatbot-experiment.md](./rag-chatbot-experiment.md)

AI Agent powered chatbot for prototyping RAG patterns before implementing them in George AI.

**Features:**

- Two AI tools: Similarity Search + File Listing
- Agent decides which tool to use automatically
- Conversation memory
- Experiment with different LLM models

## Quick Start

1. Install and run n8n: `http://localhost:5678`
2. Import a workflow JSON file
3. Configure credentials and library ID
4. Test and activate

## Prerequisites

- George AI running (`pnpm dev`)
- n8n installed and running
- Library created with API key generated
- For RAG workflow: Ollama with a model installed

## Documentation

See the individual workflow documentation files for detailed setup instructions, configuration options, and troubleshooting guides.
