- [ ] User can list his conversations.

This can be done by applying a drawer using [daisyui](https://daisyui.com/components/drawer/) as a side bar where the user can see all his conversations.

![drawer](drawer-daisyui.png)

- [ ] User can reload his conversations incl. history and all questions and answers
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
  sender          String       // 'user' or 'bot'
  content         String
  createdAt       DateTime     @default(now())
  retrievalFlow   String?
}
```

- [ ] Suggest a GraphQL for it

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

- [ ] User can go back to some previous point in his conversation and create a conversation branch . In ChatGPT you can edit every prompt you asked in time to go back and move into an other direction. Check out ChatGPT.

  ![alt text](image.png)

- [ ] Suggest UI for it

How to give feedback to the configuration of the assistant to improve the RetrievaFlow?

Idea: Get the option to turn the retrievalFlow console open where all the assistants decision are visible and the user has the potential possibility to give feedback on this decisions to allow the configuration to improve.
