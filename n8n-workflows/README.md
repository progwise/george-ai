# n8n Workflows for George AI

This folder contains n8n workflow templates for integrating with George AI.

## Available Workflows

1. **Gmail to George AI** (`gmail-to-george-ai.json`) - Automatically ingest Gmail emails and attachments into libraries
2. **RAG Chatbot Experiment** (`rag-chatbot-experiment.json`) - Prototype custom RAG patterns using George AI's data

---

# Gmail to George AI Workflow

Automatically ingest Gmail emails and attachments into George AI libraries.

## Quick Setup

### 1. Prerequisites

- George AI running: `pnpm dev`
- n8n running: `http://localhost:5678`
- Library with API key generated

### 2. Configure Credentials in n8n

**George AI API Key (Header Auth):**

```
Name: Authorization
Value: Bearer YOUR_API_KEY
```

**Gmail OAuth2:** Connect your Google account

### 3. Import & Configure

1. Import `gmail-to-george-ai.json`
2. Edit **"Set Configuration"** node:
   - `libraryId`: Your library ID
   - `graphqlUrl`: `http://app:3003/graphql`
   - `uploadUrl`: `http://app:3003/upload`
3. Assign credentials to HTTP Request nodes
4. Activate workflow

## Features

- **Automatic Mode**: Polls Gmail every minute for new emails
- **Manual Mode**: Click "Execute workflow" to bulk import recent emails (up to 10 at a time)
- Automatic duplicate detection
- Email body as RFC822 .eml with MIME headers
- Attachments uploaded with base64 encoding
- Files grouped by URI: `email:{mailbox}/{messageId}/`

## Workflow

**Automatic Mode:**
```
Gmail Trigger (every minute) → Set Config → Extract Metadata → Check Duplicate
  → Filter New → [Email Body + Attachments] → Register → Upload
```

**Manual Mode (for testing/bulk import):**
```
Manual Trigger → Get many messages (up to 10) → Set Config → ...same as above
```

## Important: Docker Networking

n8n runs in Docker and **must use service names**, not `localhost`:

- ✅ `http://app:3003/graphql`
- ❌ `http://localhost:3003/graphql`

Your browser uses `localhost`, workflows use service names.

## Troubleshooting

**401 Unauthorized**

- Check `Bearer ` prefix in API key (with space)
- Use `http://app:3003/*` not `localhost`

**Gmail not fetching**

- Re-authenticate Gmail OAuth
- Enable Gmail API in Google Cloud Console

**Files not appearing**

- Verify `pnpm dev` is running
- Check backend logs for errors

**Empty email body**

- Ensure MIME headers in .eml file
- Verify `message/rfc822` converter installed

## Customization

**Polling interval:** Edit Gmail Trigger → Poll Times

**Email filters:**

```javascript
filters: {
  q: 'is:unread'
} // Only unread
filters: {
  q: 'from:sender@example.com'
} // Specific sender
```

**Bulk import limit:** Edit "Get many messages" node → Limit (default: 10, max depends on Gmail API quotas)

**Multiple mailboxes:** Duplicate workflow with different Gmail credentials

## Usage Tips

**For Initial Import:**
1. Use the Manual Trigger to bulk import recent emails
2. Increase the "limit" in "Get many messages" node (e.g., 50)
3. Click "Execute workflow" to run once
4. After initial import, activate the workflow for automatic polling

**For Testing:**
- Use Manual Trigger instead of waiting for Gmail polling
- Check execution log to debug issues
- Verify duplicate detection is working correctly

## Security

- Generate separate API keys per workflow
- Never commit API keys
- Use HTTPS in production
- Revoke unused keys immediately

---

# RAG Chatbot Experiment Workflow

AI Agent powered chatbot with George AI tools for RAG experimentation.

## Purpose

This workflow demonstrates an **AI Agent** that can intelligently use George AI's data through tools:

- **Library Similarity Search** - Semantic/full-text search for relevant content
- **Query Library Files** - List and browse files with sorting options

The agent **autonomously decides** when to use each tool based on user queries.

## Quick Setup

### 1. Prerequisites

- George AI running: `pnpm dev`
- n8n running: `http://localhost:5678`
- Library with content and API key
- Ollama running with a model (e.g., `llama3.1:8b`)

### 2. Configure Credentials

**George AI API Key (Header Auth):**

```
Name: Authorization
Value: Bearer YOUR_API_KEY
```

### 3. Import & Configure

1. Import `rag-chatbot-experiment.json`
2. Edit **"Set Configuration"** node:
   - `libraryId`: Your library ID
   - `graphqlUrl`: `http://app:3003/graphql`
   - `ollamaUrl`: `http://gai-ollama:11434`
   - `chatModel`: Your Ollama model (e.g., `llama3.1:8b`)
   - `chunkCount`: Number of context chunks (default: 5)
   - `compareWithGeorge`: Set to `true` to compare with George AI's response
3. Assign George AI credentials to HTTP Request nodes
4. Save workflow

### 4. Test the Chat Interface

The workflow exposes an interactive chat interface. Access it via:

1. **n8n Chat Interface**: Click "Test Workflow" in n8n, or visit the chat URL shown after activation
2. **Webhook URL**: Check the "When chat message received" node for the webhook URL

**Example Interactions:**

```
User: "What are the most recent files?"
Agent: [Uses Query Library Files tool with orderBy: createdAtDesc]
      "Here are the 5 most recent files..."

User: "Find emails about invoices"
Agent: [Uses Library Similarity Search with query: "invoices"]
      "I found 3 relevant documents about invoices..."

User: "Show me all PDF files"
Agent: [Uses Query Library Files, then filters by mimeType]
      "There are 12 PDF files in the library..."
```

The agent will automatically choose the right tool based on your question.

## Workflow Architecture

```
Chat Trigger
  ↓
Set Configuration
  ↓
AI Agent (with Ollama LLM + Memory)
  ├─ Tool 1: Library Similarity Search (queryAiLibraryFiles)
  │  └─ Returns: Document chunks with highlights
  │
  └─ Tool 2: Query Library Files (aiLibraryFiles)
     └─ Returns: File metadata with sorting
  ↓
Respond to Chat
```

**How the Agent Works:**

1. User sends a message
2. Agent analyzes the request
3. Agent decides which tool(s) to use (or none)
4. Agent calls the appropriate tool(s) with parameters
5. Agent receives tool results
6. Agent formulates a response using the data
7. Response sent back to user

## Experimentation Ideas

### 1. Add More Tools

Create additional HTTP Request Tools for:

- **Get File Content**: Retrieve full document content by file ID
- **Search by Date Range**: Filter files by creation/modification date
- **Get File Chunks**: Retrieve specific chunks from a document
- **Create Conversation**: Start a George AI conversation and compare responses

### 2. Test Different LLM Models

Edit "Set Configuration" → `chatModel`:

- `llama3.1:8b` - Faster, good quality (default)
- `llama3.1:70b` - Slower, better reasoning
- `qwen2.5:latest` - Alternative model family
- `mistral` - Different response style

Compare which model makes better tool usage decisions.

### 3. Tune Tool Descriptions

Edit tool descriptions in "Library Similarity Search" and "Query Library Files" to:

- Guide the agent on when to use each tool
- Provide examples of good queries
- Explain what kind of results to expect

### 4. Adjust System Prompt

Edit the AI Agent's system message to:

- Change the assistant's personality
- Add specific instructions (e.g., "Always cite sources")
- Define answer format (e.g., "Use bullet points")
- Add domain-specific knowledge

### 5. Test Agent Reasoning

Ask questions that require:

- **Multiple tool calls**: "What are the 3 most recent files about invoices?"
- **Tool chaining**: First list files, then search specific ones
- **No tool needed**: "What can you help me with?"

### 6. Configure Memory Window

Edit "Window Buffer Memory" to adjust conversation history:

- Increase window size for longer context
- Decrease for faster responses
- Test how it affects follow-up questions

### 7. Compare with George AI

Manually compare the agent's responses with George AI's chat:

- Which finds more relevant information?
- Which has better response formatting?
- How do tool usage patterns differ?
- Is the agent faster or slower?

## Advanced Customizations

### Add a Tool for Semantic File Search

Create a new HTTP Request Tool for `aiSimilarFileChunks` (vector similarity search):

**Tool Description:**

```
Find semantically similar content within a specific file using vector embeddings.
Requires a file ID. Use this when you need deep similarity search within a known document.
```

**JSON Body:**

```javascript
={{
  JSON.stringify({
    query: 'query SimilarChunks($fileId: String!, $term: String!, $hits: Int!) { aiSimilarFileChunks(fileId: $fileId, term: $term, hits: $hits) { id fileName text section distance } }',
    variables: {
      fileId: $fromAi('fileId', ''),
      term: $fromAi('term', ''),
      hits: Number($fromAi('hits', '10')) || 10
    }
  })
}}
```

### Create a Multi-Library Agent

To search across multiple libraries:

1. Duplicate the workflow
2. Update "Set Configuration" with different library IDs
3. Expose both as separate chat interfaces
4. Or: Add a library selection parameter to the configuration

## Important: Docker Networking

n8n runs in Docker and **must use service names**:

- ✅ `http://app:3003/graphql` (George AI)
- ✅ `http://gai-ollama:11434` (Ollama)
- ❌ `http://localhost:3003/graphql` (will not work)

## Troubleshooting

**Empty response from Ollama**

- Check if model is pulled: `docker exec gai-ollama ollama list`
- Pull if needed: `docker exec gai-ollama ollama pull llama3.1:8b`
- Verify Ollama URL in configuration matches your setup

**Agent doesn't use tools**

- Check tool descriptions are clear
- Try more explicit questions: "Search for invoices" vs "What about invoices?"
- Review execution log to see agent's reasoning
- Try a different LLM model (some are better at tool usage)

**No search results**

- Verify library has processed content
- Check if library ID is correct in configuration
- Ensure files have been embedded (check library status in George AI)
- Test the GraphQL query directly in George AI playground

**Type errors in tool calls**

- Ensure `Number()` wrapping for integer parameters
- Check boolean values are properly converted
- Review the JSON.stringify expression syntax

**401 Unauthorized**

- Verify API key has `Bearer ` prefix (with space)
- Check API key is valid for the library
- Ensure credentials are assigned to all HTTP Request Tool nodes

## Tips for Prototyping

1. **Start with clear questions** - Test the agent with explicit requests first
2. **Review execution logs** - n8n shows which tools the agent calls and why
3. **Iterate on tool descriptions** - Small wording changes can improve tool usage
4. **Test edge cases** - Questions requiring multiple tools, no tools, or non-existent data
5. **Compare with George AI** - Run same questions through both systems
6. **Document insights** - Keep notes on what works better and why
7. **Experiment with models** - Different LLMs have different tool-calling abilities

## What You Can Learn

This workflow helps you prototype and validate:

### 1. Tool Design Patterns

- **Which tools are most useful?** Do users prefer search or browse?
- **What parameters should tools expose?** Sorting, filtering, pagination?
- **How should tools describe themselves?** Clear descriptions = better usage

### 2. Agent Behavior

- **Does the agent make good decisions?** Right tool at right time?
- **How does it handle ambiguity?** Does it ask clarifying questions?
- **Multi-tool scenarios**: Can it chain tools effectively?

### 3. Response Quality

- **Accuracy**: Are answers factually correct?
- **Relevance**: Does it use the right context?
- **Formatting**: Are responses well-structured?
- **Speed**: How long do tool calls take?

### 4. RAG Improvements

- **Context selection**: Does similarity search find the right chunks?
- **Chunk size**: Are default sizes optimal?
- **Ranking**: Should we re-rank search results?

## Next Steps

Once you identify patterns that work better:

### For George AI Chat Implementation:

1. Document the differences (tool design, prompting, context selection)
2. Consider implementing an agent-based chat in George AI
3. Update `assistant-chain.ts` to use proven patterns
4. Add tool-calling capabilities to George AI assistants

### For n8n Workflow Improvements:

1. Add more specialized tools (date filtering, content extraction, etc.)
2. Implement tool result caching for speed
3. Add conversation export/logging
4. Create workflows for specific use cases (email triage, document Q&A, etc.)

### For Architecture Evolution:

1. Evaluate if George AI should support external tools
2. Consider exposing George AI's RAG as a tool for other agents
3. Design a plugin system for community-contributed tools
