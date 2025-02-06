# Conversation Management Features

## 1. List Conversations

- [ ] **User can list their conversations**.

The **sidebar (drawer)** can be implemented using [daisyUI’s Drawer component](https://daisyui.com/components/drawer/) to show all user conversations:

Example screenshot from daisyUI drawer:

![Drawer from daisyUI](drawer-daisyui.png)

---

## 2. Reload Conversations (Including History and Q&A)

- [ ] **User can reload their conversations**, retrieving full history: questions and answers.

### Bookmark (Pinned Messages) Concept

#### 2.1 Pinning Individual Bubbles

Each chat bubble (user or assistant) has a “pin” icon:

- **Unpinned:** An outline star (e.g. `Pin ○`)
- **Pinned:** A filled star (e.g. `Pin ★`)

When the user pins a message, it is added to a “Bookmarked Messages” list; unpinning removes it.

```
+-----------------------------------------------+
|   [User]   "What is the capital of France?"   |
|          (time)  [Pin ○]                      |
+-----------------------------------------------+
|   [Assistant]    "The capital is Paris."      |
|          (time)  [Pin ★]   <-- pinned         |
+-----------------------------------------------+
```

#### 2.2 Bookmarked Messages Panel

**Side Panel Example**  
A drawer or side panel can list pinned messages:

```
[Open Bookmarks] button

------------------------------------------------
| (Drawer open)                                 |
|  "Bookmarked Messages"                        |
|   1) [Assistant 2:10 PM] "The capital is..."  |
|   2) [User 2:11 PM] "How about..."            |
|   3) [Assistant 2:12 PM] "Sure, let's..."     |
------------------------------------------------
```

- Shows each pinned bubble with a timestamp or snippet.
- Clicking an item could scroll/jump to that bubble in the chat.

**Dropdown Example (Top-Right)**

```
+------------------------------+
| Chat Title        [Bookmark] |
+------------------------------+
        | (the conversation)...

Clicking "Bookmark" reveals:
---------------------------------------
|  [ Pinned Messages ▼ ]              |
---------------------------------------
     1) Assistant (2:10 PM) "The capital..."
     2) User (2:11 PM) "How about..."
     3) Assistant (2:12 PM) "Sure, let's..."
```

---

#### 3 Bookmarked Search Feature

Pin messages can be searched using a search bar. This will help users to quickly find the pinned messages they are looking for. This idea can be extended to include a search feature for the entire chat history.

```
+----------------------------------------------------+
| ☰ [Chat Title]                      [Bookmark 📌] |
+----------------------------------------------------+

User clicks **Bookmark 📌** → Sidebar opens:
______________________________________________________
|  📌 Bookmarked Messages                     | X    |
|----------------------------------------------      |
| ✅ Assistant 2:10 PM  "The capital is Paris."      |
| ✅ User 2:11 PM "How about Berlin?"                |
| ✅ Assistant 2:12 PM  "Sure, let's compare..."     |
|----------------------------------------------      |
| 🔍 Search Bookmarks...                             |
|----------------------------------------------      |
| 📜 Full Chat History ➝                             |
|----------------------------------------------      |
```

## 3. Prisma Schema

- [ ] **Suggest a Prisma Schema**

Below is a sample Prisma schema for basic conversation and message storage:

```prisma
model Conversation {
  id        String    @id @default(uuid())
  userId    String
  title     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
}

model Message {
  id              String       @id @default(uuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  parentMessageId String?
  sender          String       // 'user' or 'assistant'
  content         String
  createdAt       DateTime     @default(now())
  retrievalFlow   String?
}
```

---

## 4. GraphQL Schema

- [ ] **Suggest a GraphQL schema for it**

Below is an example of how you might define your **Query** and **Mutation** types to support basic conversation functionality:

```graphql
type Conversation {
  id: ID!
  userId: String!
  title: String
  messages: [Message!]!
  createdAt: DateTime
  updatedAt: DateTime
}

type Message {
  id: ID!
  conversationId: ID!
  parentMessageId: ID
  sender: String
  content: String
  retrievalFlow: String
  createdAt: DateTime
}

type Query {
  conversations(userId: String!): [Conversation!]!
  conversation(id: ID!): Conversation
}

type Mutation {
  createConversation(userId: String!, title: String): Conversation!
  addMessage(
    conversationId: ID!
    parentMessageId: ID
    sender: String!
    content: String!
    retrievalFlow: String
  ): Message!
}
```

---

## 5. Conversation Branching

- [ ] **User can go back to a previous point in their conversation and create a conversation branch.**

In ChatGPT, you can edit or revert to any prompt in the history to branch out in a new direction. Similarly, you could:

1. Allow the user to **select** an older message in the timeline.
2. Start a **new conversation** from that point, or simply **branch** the existing conversation.

Example UI (inspiration from ChatGPT):

![Branching conversation example](image.png)

---

## 6. Suggested UI for Branching

- **Timeline or Tree View**: Visualize the conversation flow as a tree. Clicking a node returns you to that version’s state.
- **Edit Prompt**: Let the user modify the old prompt, then “re-run” from that point onward.
- **New Branch**: Save a new conversation with a different timeline.

---

## 7. Feedback on RetrievalFlow

### How to Provide Feedback

To improve the assistant’s **RetrievalFlow** configuration:

1. **RetrievalFlow Console**: Offer a console or panel showing all decisions (search queries, context expansions, vector retrieval steps, etc.).
2. **User Feedback**: Let the user mark or comment on these decisions (e.g., “This was not helpful” or “This step was great”).
3. **Configuration Updates**: Use that feedback to fine-tune parameters or weights in your retrieval system.

This can be a separate “Debug” or “Insights” panel in the UI:

```
+---------------------------------------------------+
| RetrievalFlow Console                             |
|---------------------------------------------------|
| Step 1: Searched index A with query "Paris"       |
|     [Thumbs up] [Thumbs down] [Comment]           |
| Step 2: Filtered on date range 1900-1950          |
|     [Thumbs up] [Thumbs down] [Comment]           |
| Step 3: Summarized top 5 docs                     |
|     [Thumbs up] [Thumbs down] [Comment]           |
+---------------------------------------------------+
```

---

**All tasks (checklist)**:

- [ ] User can list their conversations.
- [ ] User can reload their conversations, including history and all Q&A.
- [ ] Bookmark / Pinned Messages concept is implemented.
- [ ] Provide a Prisma schema.
- [ ] Provide a GraphQL schema.
- [ ] User can branch conversations.
- [ ] Suggest a UI approach for branching.
- [ ] Provide a RetrievalFlow console for feedback.
