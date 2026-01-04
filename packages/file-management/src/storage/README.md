### 1. Consumer-Side Implementation

Here is how your worker service should consume the `readSource` stream. In this example, we pipe it to a hash verifier or a processing engine.

```typescript
import { createHash } from 'node:crypto'
import { pipeline } from 'node:stream/promises'

async function processFileWorker(wsId: string, libId: string, fileId: string) {
  // 1. Get the stream from your storage service
  const sourceStream = await storageService.readSource(wsId, libId, fileId)

  // 2. Define your destination (e.g., an LLM extraction, S3 upload, or local hash)
  const hasher = createHash('sha256')

  try {
    // 3. Use pipeline to connect them
    // This will automatically destroy sourceStream if hashing fails
    await pipeline(sourceStream, async function* (source) {
      for await (const chunk of source) {
        // Process chunks one by one (low memory footprint)
        hasher.update(chunk)
        yield chunk // Pass it along if needed
      }
    })

    console.log('File processed successfully:', hasher.digest('hex'))
  } catch (err) {
    // If the pipeline fails, sourceStream is ALREADY closed for you
    console.error('Pipeline failed:', err)
  }
}
```

---

### 2. Why this is critical for your SaaS

1. **Memory Cap:** By using the `async function* (source)` pattern inside `pipeline`, you only ever have one "chunk" (usually 64KB) in memory at a time. Even if the file is 10GB, your worker's RAM usage remains flat.
2. **Automatic Cleanup:** If your `processFileWorker` crashes halfway through, `pipeline` ensures the file descriptor in `readSource` is closed. Without this, you would eventually hit `EMFILE` (too many open files) and your server would stop accepting new requests.
3. **Backpressure:** If your worker is doing heavy CPU work (like parsing a large CSV), the `sourceStream` will automatically "pause" reading from the disk. This prevents your internal buffers from overflowing.

---

### 3. Updated `README.md` Addition: Streaming Standards

You should add a "Streaming Standards" section to your project's `README.md` to ensure all future developers follow these rules:

> ### Streaming Standards
>
> - **Always use `pipeline`:** Never use `.pipe()`. Standard `.pipe()` does not handle error propagation correctly, leading to memory leaks and unclosed file descriptors.
> - **Zero-Copy Processing:** Use `AsyncIterables` inside pipelines to process data chunks without converting them to strings or large buffers.
> - **Hash Verification:** When reading a source, the consumer _should_ ideally verify the hash against the `FileManifest` if the operation is mission-critical.

---

### 4. Handling Extractions with Shards

If you are reading an extraction that is **sharded** (multiple files), your `readExtraction` implementation should return a **Combined Stream**.

In a SaaS environment, simply returning the stream isn't enough; you must ensure the consumer handles it without "clogging" your memory or leaving file descriptors hanging.

The `pipeline` utility is the gold standard for this. It handles **backpressure** (pausing the source if the destination is slow) and **cleanup** (closing the file if the network drops).

### 1. Consumer-Side Implementation

Here is how your worker service should consume the `readSource` stream. In this example, we pipe it to a hash verifier or a processing engine.

```typescript
import { createHash } from 'node:crypto'
import { pipeline } from 'node:stream/promises'

async function processFileWorker(wsId: string, libId: string, fileId: string) {
  // 1. Get the stream from your storage service
  const sourceStream = await storageService.readSource(wsId, libId, fileId)

  // 2. Define your destination (e.g., an LLM extraction, S3 upload, or local hash)
  const hasher = createHash('sha256')

  try {
    // 3. Use pipeline to connect them
    // This will automatically destroy sourceStream if hashing fails
    await pipeline(sourceStream, async function* (source) {
      for await (const chunk of source) {
        // Process chunks one by one (low memory footprint)
        hasher.update(chunk)
        yield chunk // Pass it along if needed
      }
    })

    console.log('File processed successfully:', hasher.digest('hex'))
  } catch (err) {
    // If the pipeline fails, sourceStream is ALREADY closed for you
    console.error('Pipeline failed:', err)
  }
}
```

---

### 2. Why this is critical for your SaaS

1. **Memory Cap:** By using the `async function* (source)` pattern inside `pipeline`, you only ever have one "chunk" (usually 64KB) in memory at a time. Even if the file is 10GB, your worker's RAM usage remains flat.
2. **Automatic Cleanup:** If your `processFileWorker` crashes halfway through, `pipeline` ensures the file descriptor in `readSource` is closed. Without this, you would eventually hit `EMFILE` (too many open files) and your server would stop accepting new requests.
3. **Backpressure:** If your worker is doing heavy CPU work (like parsing a large CSV), the `sourceStream` will automatically "pause" reading from the disk. This prevents your internal buffers from overflowing.

---

### 3. Updated `README.md` Addition: Streaming Standards

You should add a "Streaming Standards" section to your project's `README.md` to ensure all future developers follow these rules:

> ### Streaming Standards
>
> - **Always use `pipeline`:** Never use `.pipe()`. Standard `.pipe()` does not handle error propagation correctly, leading to memory leaks and unclosed file descriptors.
> - **Zero-Copy Processing:** Use `AsyncIterables` inside pipelines to process data chunks without converting them to strings or large buffers.
> - **Hash Verification:** When reading a source, the consumer _should_ ideally verify the hash against the `FileManifest` if the operation is mission-critical.

---

### 4. Handling Extractions with Shards

If you are reading an extraction that is **sharded** (multiple files), your `readExtraction` implementation should return a **Combined Stream**.

To implement a **Serial Stream Combiner** for sharded files (like your `0001.md`, `0002.md`, etc.), we use an **Async Generator**.

This is the most memory-efficient way to handle large data in a SaaS environment because it only opens **one file descriptor at a time**, reads it to completion, closes it, and moves to the next. To the consumer, it looks like one single, giant file.

### 1. The Shard Combiner Logic

We will use `pipeline` internally to ensure that if the consumer stops reading (e.g., the network connection is lost), the current shard is closed immediately.

```typescript
import { createReadStream } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'

/**
 * Combines all shards in a directory into a single Readable stream.
 * Shards are processed one-by-one to keep memory usage low.
 */
export async function readShards(shardsDirPath: string): Promise<Readable> {
  // 1. Get all shard files and sort them numerically/lexically
  const files = await readdir(shardsDirPath)
  const sortedShards = files
    .filter((f) => f.endsWith('.md')) // or your specific extension
    .sort()

  // 2. Define an Async Generator to yield data chunk by chunk
  async function* shardGenerator() {
    for (const shardFile of sortedShards) {
      const shardPath = path.join(shardsDirPath, shardFile)
      const shardStream = createReadStream(shardPath)

      try {
        // Yield each chunk from the current shard
        for await (const chunk of shardStream) {
          yield chunk
        }
      } finally {
        // Ensure the stream is destroyed if the generator exits prematurely
        shardStream.destroy()
      }
    }
  }

  // 3. Convert the generator into a standard Readable stream
  return Readable.from(shardGenerator())
}
```

---

### 2. Why this is perfect for your SaaS

1. **Low File Descriptor (FD) Pressure:** If you have 5,000 shards, a naive approach might try to open them all at once. This generator only opens **one FD**. As soon as shard `0001` is done, it is closed before `0002` is opened.
2. **Flat RAM Usage:** Memory usage will never exceed the size of a single chunk (usually 64KB), regardless of how many thousands of shards you have.
3. **Seamless Integration:** Since your `IStorageService` interface uses `Promise<Readable>`, the rest of your app doesn't need to know if it's reading a single file or a sharded extraction. It just calls `await readExtraction(...)` and pipes the result.

---

### 3. Usage in your `readExtraction` Implementation

This ties together your `ExtractionMetadata` and the physical shards.

```typescript
export async function readExtraction(wsId: string, libId: string, fileId: string, methodId: string): Promise<Readable> {
  const extractionDir = path.join(
    this.rootDir,
    'workspaces',
    wsId,
    'libraries',
    libId,
    'files',
    fileId,
    'extractions',
    methodId,
  )

  // 1. Load manifest to check if it's sharded
  const metadata = await getExtractionMetadata(extractionDir)
  if (!metadata) throw new Error('Extraction not found')

  // 2. Determine if we read a single file or a shards directory
  if (metadata.output.isSharded) {
    const shardsPath = path.join(extractionDir, 'shards')
    return readShards(shardsPath)
  } else {
    const filePath = path.join(extractionDir, metadata.output.mainFile)
    return createReadStream(filePath)
  }
}
```

---

### 4. Updated `README.md` Addition: Sharding Strategy

> ### Sharding & Virtual Streams
>
> - **Numerical Padding:** Shards must be named with leading zeros (e.g., `0001.md`) to ensure correct sort order during retrieval.
> - **Virtual Concatenation:** Extractions that are sharded must be accessed via the `readExtraction` method, which handles virtual concatenation using Async Generators.
> - **Consumer Awareness:** Consumers receive a single stream and are unaware of the underlying sharding, allowing the storage engine to scale horizontally without changing business logic.

### Final Refactor Checklist

- [x] **`fs/promises`** for non-blocking I/O.
- [x] **Atomic writes** for manifest integrity.
- [x] **Streams-only** for memory efficiency.
- [x] **Hash-based validation** for "Active vs Stale" logic.
- [x] **Relocatable folders** (no parent-ids).

You now have a complete architectural blueprint for a self-containing, high-performance SaaS storage system. Good luck with the refactoring!
