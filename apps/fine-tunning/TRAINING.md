# README: Automated Fine-Tuning Pipeline for RAG Model

This document outlines best practices and an automated pipeline to prepare fine-tuning datasets for a Retrieval-Augmented Generation (RAG) system built with LangChain (TypeScript) and TanStack. The system serves multiple companies who upload their private documents. We perform document ingestion, chunking, and embedding generation at the time of upload, and we aim to generate high-quality fine-tuning datasets per company on a weekly basis.

---

## ✨ System Overview

Your system includes:

- Crawling & uploading documents (PDF, DOCX, XLSX, TXT, etc.) per company
- Chunking documents and generating embeddings using LangChain + TypeScript
- RAG-based QA interface per company
- **Weekly fine-tuning of foundation models** using company-specific data (private to each company)

---

## 🔄 Weekly Fine-Tuning Pipeline

```mermaid
flowchart TD
    A[Weekly Trigger (Per Company)] --> B[New File Uploads or Crawled URLs]
    B --> C[Parse & Chunk Documents]
    C --> D[Generate Embeddings via API]
    C --> E[Archive Raw Chunks (per doc, per company)]
    E --> F[Monitor Company-Specific User Queries & RAG Responses]
    F --> G[Log Query + Retrieved Chunks + RAG Response]
    G --> H[Data Preprocessor (Filter, Annotate, Validate)]
    H --> I{Training Mode?}
    I -->|Supervised| J1[(query, context, response)]
    I -->|Semi-Supervised| J2[Auto-label w/ Confidence Threshold]
    I -->|RLHF| J3[Reward Model Scoring or Human Ratings]
    I -->|Unsupervised| J4[Unlabeled Embedding + Clustering Signals]
    J1 --> K[Format as JSONL or HuggingFace Format]
    J2 --> K
    J3 --> K
    J4 --> K
    K --> L[Fine-Tune Model (Per Company)]
    L --> M[Evaluate + Archive Model]
    M --> N[Deploy Company-Specific Fine-Tuned Model]
```

---

## 📒 Step-by-Step Instructions

### 1. **Document Upload / Crawling (Per Company)**

- Companies upload documents or submit URLs to crawl
- Files are stored securely in their private data space

### 2. **Document Chunking & Embedding**

- Use `RecursiveCharacterTextSplitter` (LangChain.js)

```ts
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ".", " ", ""]
});
```

- Immediately after chunking, call embedding API and store both:

  - Embedding vectors (to VectorDB)
  - Raw text chunks (for fine-tuning preparation)

### 3. **Conversation Logging**

- Log each query + top-k retrieved chunks + RAG-generated response
- Store logs with metadata (companyID, docID, chunkIDs, timestamp)

### 4. **Training Set Preparation (Automated)**

- Retrieve high-quality samples from usage logs
- Preprocess:

  - Deduplicate similar questions
  - Filter failed / irrelevant answers
  - Prioritize informative, full answers (e.g., lists with 20+ items)

### 5. **Choose Training Strategy**

#### 🧠 Designing a Reward Model for Semi-Supervised Filtering

To automatically filter high-quality samples for fine-tuning, implement a lightweight reward scoring function that evaluates RAG outputs (query, context, response triples). The reward model can be a rule-based, LLM-based, or ML-based scorer.

**Scoring Heuristics (combine multiple):**

- **Completeness Score**: Are all requested items/entities answered?

  - Regex-based list detection or item count heuristics (e.g., > 35 out of 40 listed)

- **Relevance Score**: Cosine similarity between query and response embeddings (e.g., OpenAI, Cohere, or `bge-base`)
- **Factuality Score** _(optional)_: Does the response overlap semantically with retrieved chunk(s)?

  - Can be done with sentence similarity models (e.g., `nli-roberta`, `bge-reranker`)

- **Language Quality**: Use a base LLM to rate coherence and clarity (prompted with rating scale)

**LLM-based reward prompt example:**

```
Evaluate the following answer to the given query. Rate from 1 (poor) to 5 (excellent).
Query: <QUERY>
Context: <CHUNKS>
Answer: <RESPONSE>
Explain your reasoning and provide a score.
```

Store:

```json
{
  "prompt": "<query>

Context: <chunk>...",
  "completion": "<response>",
  "reward": 4.2
}
```

Filter for fine-tuning if `reward >= 4.0`

---

#### ✅ Supervised Learning

- Requires verified query-response pairs
- Sources: Logged high-quality RAG outputs
- Format:

```json
{
  "prompt": "What is the return policy?\n\nContext: Returns accepted within 30 days.",
  "completion": "Returns are accepted within 30 days."
}
```

#### ✅ Semi-Supervised Learning

- Auto-labeling with confidence thresholds
- Use LLM to score the completeness and relevance
- Format same as supervised, filtered by score > threshold (e.g., 0.8)

#### ✅ Reinforcement Learning (RLHF)

- Use reward scores (human thumbs up/down or internal reward model)
- Format: (prompt, completion, reward)

#### ✅ Unsupervised Learning

- Leverage embeddings & clustering to pretrain with contrastive or masked objectives
- Format: raw chunks or sentence windows (no labels)
- Pretraining on general company-specific corpus before supervised finetuning

> Recommendation: Begin with supervised and expand into semi-supervised + unsupervised pretraining as data grows.

### 6. **Dataset Formatting**

- Store per company in `/datasets/{company_id}/train.jsonl`
- Example formats:

**Supervised / Semi-supervised**:

```json
{
  "prompt": "List all company services.\n\nContext: We offer web hosting, SEO, analytics, and cloud deployment.",
  "completion": "Our services include web hosting, SEO, analytics, and cloud deployment."
}
```

**RLHF**:

```json
{
  "prompt": "Explain the cancellation policy.\n\nContext: You may cancel within 48 hours.",
  "completion": "Cancellations are accepted within 48 hours.",
  "reward": 4.7
}
```

**Unsupervised**:

```json
{
  "chunk": "Employees must submit reimbursement forms within 15 days of purchase.",
  "embedding": [0.0123, 0.874, 0.533, ...]
}
```

### 7. **Fine-Tuning**

- Use scheduler (GitHub Actions, Cron, Airflow) to run weekly
- Train new models using LoRA, QLoRA, or full fine-tuning
- Track: training loss, BLEU/ROUGE scores, human eval feedback

### 8. **Model Deployment**

- Deploy per-company models in a multi-tenant architecture
- Feature flag or A/B test new model vs baseline RAG model
- Always retain fallback to base model if performance drops

---

## 🧵 Notes & Best Practices

- Data remains private per company — use isolated datasets and models
- Leverage user interactions to drive high-quality supervised training data
- Use company-specific metadata to group logs and trace training origins
- If using RLHF or reward models, add human-in-the-loop where applicable
- Track training set lineage and score evolution for transparency

---

## ⚒️ Tools & Technologies

| Component     | Tool Suggestions                               |
| ------------- | ---------------------------------------------- |
| File Loaders  | LangChain.js, `pdfjs`, `mammoth`, `xlsx`       |
| Chunking      | LangChain RecursiveCharacterTextSplitter       |
| Vector DB     | Pinecone, Qdrant, Weaviate                     |
| Logging       | Supabase, MongoDB, or custom SQL schema        |
| Preprocessing | Python, TypeScript                             |
| Fine-tuning   | HuggingFace Transformers, Axolotl, LoRA, QLoRA |
| Scheduler     | GitHub Actions, Airflow, Prefect               |

---

## 🔑 Security & Privacy

- Per-company document and model isolation
- Log access control per tenant
- Encrypt all data at rest and in transit
- Allow opt-out for training or use anonymized aggregation

---

## 📚 License

Proprietary - Internal use only
