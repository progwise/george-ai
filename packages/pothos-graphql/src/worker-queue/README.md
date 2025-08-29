# Worker Queue System

This package contains workers that process AI library tasks asynchronously using a clean timestamp-based state system.

## Content Extraction Worker

Converts uploaded files into searchable markdown and vector embeddings through a 3-phase pipeline.

### Processing Flow

```
Processing Started → Validation → Extraction OR Skip → Embedding OR Skip → Processing Finished
```

### Schema Design Philosophy

- **Consistent patterns**: Each phase has `StartedAt`, `FinishedAt`, `FailedAt` timestamps
- **Boolean flags**: Quick filtering with `processingTimeout`, `extractionTimeout`, `embeddingTimeout`
- **Skip capabilities**: `extractionSkipped`, `embeddingSkipped` for flexible workflows
- **Rich metadata**: JSON metadata preserves detailed error info and processing notes

### Task States & Timestamps

#### Processing Lifecycle
- **`createdAt`** - When task was submitted (automatic)
- **`processingStartedAt`** - When worker picks up task (start of entire pipeline)
- **`processingFinishedAt`** - When entire pipeline completes successfully (mutually exclusive with `processingFailedAt`)
- **`processingFailedAt`** - Validation failures, infrastructure errors, or timeout (mutually exclusive with `processingFinishedAt`)
- **`processingTimeout`** - Boolean flag for infrastructure timeouts (default: 30 minutes)

#### Extraction Phase
- **`extractionStartedAt`** - Set after validation passes, before extraction begins (null for embedding-only)
- **`extractionFinishedAt`** - Successfully converted to markdown
- **`extractionFailedAt`** - Converter failed (file corrupt, unsupported format)
- **`extractionTimeout`** - Boolean flag for converter-determined timeouts (e.g., OCR page limits)

#### Embedding Phase
- **`embeddingStartedAt`** - Vector embedding process started (null if no markdown available)
- **`embeddingFinishedAt`** - Embeddings created and stored
- **`embeddingFailedAt`** - Embedding process failed (no markdown, service error)
- **`embeddingTimeout`** - Boolean flag for embedding service timeouts

### Queue Processing Rules

**Tasks are picked up when:**
- `processingStartedAt` is null (task hasn't been touched by any worker)

**Once `processingStartedAt` is set, the task is never reprocessed.**

### Supported Extraction Methods

- `pdf-text-extraction` - Direct PDF text extraction (fast, high accuracy for text-based PDFs)
- `docx-extraction` - Microsoft Word documents (.docx)
- `excel-extraction` - Excel spreadsheets converted to markdown tables (.xlsx)
- `csv-extraction` - CSV files converted to markdown tables
- `html-extraction` - HTML documents converted to clean markdown
- `text-extraction` - Plain text, Markdown, JSON, XML files
- `pdf-image-llm` - PDF pages converted to images and processed via LLM vision models (Qwen 2.5 VL) for scanned documents
- `tesseract-ocr` - Traditional OCR using Tesseract (NOT YET IMPLEMENTED)
- `embedding-only` - Skip extraction, use existing markdown content for re-embedding

### Task Types & Workflows

#### Standard Processing Task
```
processingStartedAt → validation → extractionStartedAt → converter → 
extractionFinishedAt → embeddingStartedAt → embedding → embeddingFinishedAt → processingFinishedAt
```

#### Embedding-Only Task
```
processingStartedAt → validation → embeddingStartedAt → 
embedding → embeddingFinishedAt → processingFinishedAt
```
(Note: extractionStartedAt remains null for embedding-only tasks)

#### Failed Validation Task
```
processingStartedAt → validation fails → processingFailedAt
```
(Note: No extraction or embedding phases are attempted)

## Analytics & Monitoring

### Key Metrics Available
- **Queue Wait Time**: `processingStartedAt - createdAt`
- **Total Processing Time**: `processingFinishedAt - processingStartedAt`
- **Extraction Time**: `extractionFinishedAt - extractionStartedAt` (if extraction ran)
- **Embedding Time**: `embeddingFinishedAt - embeddingStartedAt` (if embedding ran)

### Timeout Behavior
- **Infrastructure Timeout**: Configurable via `timeoutMs` field (default: 30 minutes)
  - Starts counting when worker picks up task (`processingStartedAt`)
  - Prevents workers from getting stuck indefinitely
  - Sets `processingTimeout: true` when exceeded
- **Extraction Timeouts**: Converter-specific (e.g., OCR per-page limits)
  - Sets `extractionTimeout: true` when converter determines timeout
- **Embedding Timeouts**: Service-level timeouts from embedding provider
  - Sets `embeddingTimeout: true` when embedding service times out

### Result Data Fields
- **`markdownFileName`** - Generated markdown file name
- **`chunksCount`** - Number of embedding chunks created
- **`chunksSize`** - Total size of all embedding chunks
- **`metadata`** - JSON with processing details, errors, confidence scores

## Common Configurations

- **Processing Interval**: 5 seconds
- **Max Concurrent Tasks**: 3 per worker type
- **Default Infrastructure Timeout**: 30 minutes per task
- **Queue Order**: Oldest tasks first (`ORDER BY createdAt ASC`)

## Error Handling Philosophy

- **Validation Errors**: Business logic failures (file not found, invalid config), no retry
- **Processing Errors**: Converter/AI failures, logged with details in metadata
- **Infrastructure Errors**: DB/network issues, logged but don't corrupt task state
- **Timeout Handling**: Multiple levels (infrastructure, converter, embedding service)

## Monitoring Key Points

1. **Stuck Tasks**: Check for tasks with `processingStartedAt` but no `processingFinishedAt`
2. **Failed Processing**: Tasks with `processingFailedAt` indicate validation/infrastructure issues
3. **Extraction Issues**: Tasks with `extractionFailedAt` or `extractionTimeout: true`
4. **Embedding Issues**: Tasks with `embeddingFailedAt` or `embeddingTimeout: true`
5. **Skipped Processing**: Use boolean flags to identify intentionally skipped phases
6. **Queue Depth**: Count tasks with `processingStartedAt: null` for queue backlog

## Database Queries

### Find Pending Tasks
```sql
SELECT * FROM AiFileContentExtractionTask 
WHERE processingStartedAt IS NULL 
ORDER BY createdAt ASC;
```

### Find Tasks with Extraction Timeouts
```sql
SELECT * FROM AiFileContentExtractionTask 
WHERE extractionTimeout = true;
```

### Find Embedding-Only Tasks
```sql
SELECT * FROM AiFileContentExtractionTask 
WHERE extractionSkipped = true;
```

### Calculate Processing Metrics
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (processingFinishedAt - processingStartedAt))) as avg_processing_seconds,
  AVG(EXTRACT(EPOCH FROM (processingStartedAt - createdAt))) as avg_queue_wait_seconds
FROM AiFileContentExtractionTask 
WHERE processingFinishedAt IS NOT NULL;
```