## Data Formats by Model Type

### 1. **Causal / Instruction Models**

| Model Type                     | Supported Format                         | Example                                                                                                   |
| ------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| OPT, LLaMA, Gemma 3, CodeLlama | `{"prompt": "...", "completion": "..."}` | `{"prompt":"Translate to German: Hello","completion":"Hallo"}"`|

### 2. **Chat / Conversational Models**

| Model Type                                          | Supported Format                                    | Example                                                                                                                                                           |
| --------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Qwen‑chat, Phi‑instruct, LLaMA‑chat, Gemma (ChatML) | `{"messages":[{"role":"system","content":"..."}…]}` | `{"messages":[{"role":"system","content":"You are helpful."},{"role":"user","content":"What is 2+2?"},{"role":"assistant","content":"4"}]}`|

### 3. **Standard Language Modeling**

| Model Task | Supported Format | Example                           |
| ---------- | ---------------- | --------------------------------- |
| LM tuning  | `{"text":"..."}` | `{"text":"Once upon a time..."}`  |

### 4. **Preference / Ranking Data**

| Use Case               | Supported Format                                   | Example                                                                           |
| ---------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------- |
| RL from human feedback | `{"prompt":"...","chosen":"...","rejected":"..."}` | `{"prompt":"A and B","chosen":"Blue.","rejected":"Green."}`|

### 5. **Unpaired Preference**

| Format                                                   | Example                                                                |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| `{"prompt":"...","completion":"...","label":true/false}` | `{"prompt":"X?","completion":"Y.","label":true}` ([huggingface.co][3]) |

### 6. **Stepwise Supervision**

| Format                                                 | Example                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `{"prompt":"...","completions":[...],"labels":[...]} ` | `{"prompt":"Compare", "completions":["a","b"], "labels":[true,false]}`  |

### 7. **Multimodal / Vision–Language Models**

| Model Type                               | Supported Format                                                                                                        | Example                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Llama‑3.2‑Vision, Qwen‑2‑VL, Pixtral‑12B | `{"messages":[{"role":"system",...},{"role":"user","content":"Caption this image."},{"image":<binary>,"role":"user"}]}` | Format images + text together |

---

## Acceptable Formats per Model

```markdown
### Causal / Text‑only LLMs
{"prompt": "Your instruction", "completion": "Desired response"}

### Chat / Conversational LLMs
{"messages":[
  {"role":"system","content":"You are a helpful assistant."},
  {"role":"user","content":"How deep is the ocean?"},
  {"role":"assistant","content":"About 3.7 km on average."}
]}

### Language Modeling
{"text":"Once upon a time ..."}

### Preference / Ranking (RLHF)
{"prompt":"What color?", "chosen":"Blue.","rejected":"Green."}

### Unpaired Preference
{"prompt":"Hello","completion":"Hi there!","label":true}

### Stepwise Supervision
{"prompt":"Solve 2+2 stepwise",
 "completions":["Step1","Step2","Final answer"],
 "labels":[false,false,true]
}

### Multimodal LLMs (Vision + Text)
{"messages":[
  {"role":"system","content":"Describe the image."},
  {"role":"user","content":"What is shown?"},
  {"role":"assistant","content":""}
],
 "image": "<binary image blob>"}
```

# Suggested Database Schema
```sql
CREATE TABLE fine_tune_examples (
  id SERIAL PRIMARY KEY,
  format_type VARCHAR NOT NULL,        -- e.g., 'prompt_completion', 'chat', 'preference', 'multimodal'
  prompt TEXT,                         -- For prompt/completion or preference
  completion TEXT,                     -- For prompt/completion, unpaired preference
  chat_messages JSONB,                 -- Array of message dicts for chat format
  chosen TEXT,                         -- For preference ranking
  rejected TEXT,                       -- For preference ranking
  label BOOLEAN,                       -- For unpaired preference
  completions TEXT[],                  -- List of candidate steps/responses
  labels BOOLEAN[],                    -- Corresponding boolean flags (stepwise supervision)
  image_data BYTEA,                    -- For multimodal examples
  metadata JSONB,                      -- Any additional info/IDs/tags
  created_at TIMESTAMP DEFAULT NOW()
);
```