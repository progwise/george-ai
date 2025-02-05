# **George-AI Assistant Enhancements: Concepts & Designs**

## **1. User can list their conversations**

### **Goal**

Give users the ability to **see all** of their past conversation sessions with the George-AI assistant, so they can select or revisit them.

### **User Flow**

1. **User navigates** to the “Conversations” page or a “My Conversations” panel.
2. **System displays** a list of conversation entries:
   - Title or short snippet (e.g., first user message or user-defined name).
   - Timestamp or “last updated” time.
3. The user **clicks** one to reopen that conversation in detail.

### **UI Sketch**

```
+----------------------------------------------------------+
|  My Conversations                                        |
+----------------------------------------------------------+
|  Conversation Title (Timestamp)  [> Open]               |
|  Conversation Title (Timestamp)  [> Open]               |
|  Conversation Title (Timestamp)  [> Open]               |
|  ...                                                    |
+----------------------------------------------------------+
```

_(When the user clicks “Open,” they load the conversation including all Q&A.)_

---

## **2. User can reload conversation incl. history (Q&A)**

### **Goal**

Once a user picks a conversation, let them **load** it with **all** the previous questions and answers.

### **User Flow**

1. User selects a conversation from the list.
2. The app **fetches** all messages (Q&A) from the database.
3. **Display** these messages in chronological order, enabling the user to read or continue the conversation.

### **UI Sketch**

```
+---------------------------+
|   [Back to Conversations] |
+---------------------------+
| [User]   Hello?           |
| [Bot]    Hi there...      |
| [User]   Another Q?       |
| [Bot]    Another A!       |
|   ...                     |
+---------------------------+
```

---

## **3. Suggest a Prisma Schema**

Below is a **sample** Prisma schema for storing conversations, messages, and branching:

```prisma
model Conversation {
  id           String   @id @default(uuid())
  userId       String   // link to user table
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  title        String?
  messages     Message[]
}

model Message {
  id              String         @id @default(uuid())
  conversationId  String
  conversation    Conversation   @relation(fields: [conversationId], references: [id])
  parentMessageId String?        // for branching or editing
  sender          String         // 'user' or 'bot'
  content         String
  createdAt       DateTime       @default(now())
  retrievalFlow   String?        // e.g. 'Sequential', 'Only Local'
  // Possibly:
  // branchName or branchId if you want multiple named branches
}
```

---

## **4. Suggest a GraphQL for it**

A minimal GraphQL schema (using SDL style) might look like:

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
  createdAt: DateTime
  retrievalFlow: String
}

type Query {
  # List user conversations
  conversations(userId: String!): [Conversation!]!

  # Fetch a single conversation
  conversation(id: ID!): Conversation
}

type Mutation {
  # Create new conversation
  createConversation(userId: String!, title: String): Conversation!

  # Add a message to conversation
  addMessage(
    conversationId: ID!
    parentMessageId: ID
    sender: String!
    content: String!
    retrievalFlow: String
  ): Message!
}

scalar DateTime
```

---

## **5. Conversation Branching**

### **Concept**

Users should be able to **go back** to a previous point in a conversation and “branch” it off in a new direction — like how Git forks a branch. This is similar to ChatGPT’s “edit prompt” and re-ask approach.

### **Flow**

1. **User** scrolls up to a prior message.
2. **User clicks** “Branch from here” or “Edit from here,” creating a new path.
3. The system **spawns** a new conversation branch with a new chain of answers.

### **UI Sketch**

```
 Conversation A:

  [User Q1]        <- can "branch" here
   \
    [Bot A1]
     \
      [User Q2] (current path)
       \
        [Bot A2]
```

_(User picks Q1 to “branch,” the system forks a new path in a separate conversation record.)_

---

## **6. Suggest UI for it**

### **Branching UI**

- **Inline “Branch from here”** button on older messages:
  ```
  +----------------------------------------------------------------------------------+
  |  [User]  Q #1   (time)       [Branch?]                                          |
  +----------------------------------------------------------------------------------+
  |  [Bot]   A #1   (time)                                                          |
  +----------------------------------------------------------------------------------+
  ```
- **New conversation** gets a new ID or title, stored in DB.

---

## **7. Feedback for Assistant Configuration (RetrievalFlow)**

### **Idea**

Give users a “RetrievalFlow console” to see how the assistant decided to go local vs. web vs. model. Then allow them to “rate” or comment on these decisions.

### **Flow**

1. **User** toggles “RetrievalFlow Debug Console.”
2. **System** displays a log: “Used Local → Not enough info → Used Web → Final answer.”
3. **User** can leave feedback: e.g., “Local had it, but was missed!”
4. Future runs might incorporate this feedback to refine which retrieval path is chosen.

### **UI Sketch**

```
[ ] Show Retrieval Debug
 ---------------------------------------------------------
|  Local stage: insufficient data -> next stage: Web     |
|  Web stage: found relevant data... -> final answer     |
|                                                        |
| Feedback: [ The local actually had data, but text not recognized ]
| [Submit Feedback]                                      |
 ---------------------------------------------------------
```

---

## **Figures**

1. **Conversations List**

   ```
   +----------------------------------+
   | My Conversations                |
   +----------------------------------+
   | * "Website QnA" (3/12/2025)     |
   | * "Travel Queries" (3/13/2025)  |
   | * "Demo Chat" (3/15/2025)       |
   +----------------------------------+
   ```

2. **Branching Diagram**

   ```
        Q1 -> A1
               \
                Q2 -> A2
               /
        (Branch from Q1)
   ```

3. **Retrieval Debug**
   ```
   Stage: Local -> Not Enough Info
   Stage: Web   -> Found relevant snippet
   Stage: Model -> Final Answer
   [User Feedback Field...]
   ```

---

**End of Document**.  
By following these concepts, we integrate **list/reload** of conversations, a **branching** mechanism, **feedback** for retrieval decisions, **Prisma** & **GraphQL** schemas, and a **UI** that elegantly represents branching and data flow.
