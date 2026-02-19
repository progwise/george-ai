# Data Storage & Manifest Specification

## 1. Directory Hierarchy

The storage is structured to be **relocatable**. No manifest contains a hardcoded `parent_id`. Relationships are defined by the physical path.

```text
workspaces/
└── {ws-id}/
    ├── manifest.json            # Workspace Metadata & Aggregate Stats
    └── libraries/
        └── {lib-id}/
            ├── manifest.json    # Library Metadata & Aggregate Stats
            └── files/
                └── {file-id}/
                    ├── manifest.json   # File Identity & Current Source Hash
                    ├── source          # The original unmodified file
                    └── extractions/
                        └── {method-id}/
                            ├── metadata.json  # Integrity Hash & Status
                            ├── output.md      # Primary Result
                            └── shards/        # Partitioned data (if large)
                                ├── 0001.md
                                └── 0002.md

```

---

## 2. Core Metadata Schemas (Zod)

### A. Storage Statistics (Reusable)

Used at all levels to track usage and detect "Data Debt" (stale extractions).

```typescript
const StorageStatsSchema = z.object({
  activeBytes: z.number().int().nonnegative(), // Source + Hash-matching extractions
  physicalBytes: z.number().int().nonnegative(), // Actual size on disk/S3
  lastFullScan: z.string().datetime().optional(),
  lastUpdated: z.string().datetime(),
})
```

### B. File Manifest

The anchor link between the `source` and processed results.

```typescript
export const FileManifestSchema = z.object({
  version: z.literal(1),
  id: z.string().uuid(),
  originalName: z.string(),
  mimeType: z.string(),
  currentSourceHash: z.string(), // SHA-256 of the 'source' file
  sizeStats: StorageStatsSchema.extend({
    sourceBytes: z.number().int().nonnegative(),
  }),
})
```

### C. Extraction Metadata

Ensures extractions are immutable and tied to a specific version of the source.

```typescript
export const ExtractionMetadataSchema = z.object({
  version: z.literal(1),
  methodId: z.string(), // e.g., "gpt4o-v1"
  sourceHashAtExecution: z.string(), // Must match FileManifest.currentSourceHash
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  sizeBytes: z.number().int().nonnegative(),
  executedAt: z.string().datetime(),
  output: z.object({
    isSharded: z.boolean().default(false),
    shardCount: z.number().int().optional(),
  }),
})
```

---

## 3. Data Integrity & Logic

### Active vs. Physical Usage

- **Active Bytes:** Represents valid, usable data. Calculated as:

- **Physical Bytes:** The total footprint of the folder. Used for billing and identifying when to run garbage collection.

### Moving Entities

- **Libraries/Files:** To move a folder, physically relocate it and update the `activeBytes` and `physicalBytes` in the destination's workspace/library manifest via the **Bubbling Update** mechanism.
- **Extractions:** Extractions are bound to their parent `file-id` and should not be moved independently.

### Stale Data Handling

If `FileManifest.currentSourceHash !== ExtractionMetadata.sourceHashAtExecution`, the extraction is considered **Stale**.

- The UI should display a warning or trigger a re-extraction.
- Garbage collection can safely delete any extraction folder where this mismatch exists.

---

## 4. Maintenance Operations

1. **Bubbling Update:** Triggered on file write. Recursively updates parent `totalBytes` upwards.
2. **Deep Scan (Reconciliation):** A daily task that re-sums actual file sizes on disk and updates manifests to correct any drift.
3. **DB Sync:** A background task that reads these manifests and `UPSERT`s the values into Postgres to keep the search index and UI fast.
