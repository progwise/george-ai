- [ ] User can list their conversations.

This can be done by using a drawer from [daisyui](https://daisyui.com/components/drawer/) as a sidebar where the user can see all their conversations.

![drawer](drawer-daisyui.png)

- [ ] User can reload their conversations, including history and all questions and answers.

  **Bookmark/Pinned Messages Concept**

**1) Pinning Individual Bubbles**

**Sketch**: In the conversation UI, each bubble (user or assistant) has a “pin” icon. The icon is **empty** if not pinned, **filled** if pinned.

```plaintext
+-----------------------------------------------+
|   [User]   "What is the capital of France?"   |
|          (time)  [Pin ○]                      |
+-----------------------------------------------+
|   [Assistant]    "The capital is Paris."      |
|          (time)  [Pin ★]   <-- pinned         |
+-----------------------------------------------+
```

- **Pin ○** = Outline star/icon (un-pinned).
- **Pin ★** = Filled star/icon (pinned).

When the **user** clicks the pin, that message is added (or removed) from a “Bookmarked Messages” list.

---

**2) Bookmarked Messages Panel**

We can provide a side panel or a top dropdown to **list** pinned chat bubbles. Here’s a **drawer** or **dropdown** approach:

**Side Panel Example**

```plaintext
[Open Bookmarks] button

------------------------------------------------
| (Drawer open)                                 |
|  "Bookmarked Messages"                        |
|   1) [Assistant 2:10 PM] "The capital is..."  |
|   2) [User 2:11 PM] "How about..."            |
|   3) [Assistant 2:12 PM] "Sure, let's..."     |
------------------------------------------------
```

- Each pinned bubble has a **snippet** or **timestamp**.
- Clicking one jumps the user to that bubble in the chat, or expands it inline.

**Dropdown Example (top-right)**

```plaintext
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

- [ ] Suggest a Prisma Schema

  **Sample Prisma Schema:** <a name="sample-prisma-schema"></a>

```prisma
model Conversation {
    id           String   @id @default(uuid())
    userId       String
    title        String?
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt
    messages     Message[]
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

- [ ] Suggest a GraphQL schema for it

  **GraphQL Example:** <a name="graphql-example"></a>

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

- [ ] User can go back to a previous point in their conversation and create a conversation branch. In ChatGPT, you can edit every prompt you asked in time to go back and move in another direction. Check out ChatGPT.

  ![alt text](image.png)

- [ ] Suggest UI for it

How to give feedback to the configuration of the assistant to improve the RetrievalFlow?

Idea: Provide an option to open the retrievalFlow console where all the assistant's decisions are visible, and the user can give feedback on these decisions to improve the configuration.
