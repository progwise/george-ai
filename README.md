# George AI Project

Welcome to the **George AI Project**!

This project features a chatbot agent built with LangChain that prioritizes local PDF-based retrieval before resorting to web or model-generated content. The agent now clearly indicates the source of its answers—**"local"**, **"web"**, or **"model"**—ensuring greater transparency in how responses are derived.

## Table of Contents

- [George AI Project](#george-ai-project)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [Clone and Install Dependencies](#clone-and-install-dependencies)
    - [Install Docker](#install-docker)
      - [Installing on Debian](#installing-on-debian)
    - [Running the Server and Chat Interface](#running-the-server-and-chat-interface)
      - [Start the Server](#start-the-server)
      - [Start the Chat Interface](#start-the-chat-interface)
      - [Sending Messages via GraphiQL](#sending-messages-via-graphiql)
  - [Modifying the Chat Bot Agent](#modifying-the-chat-bot-agent)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or later.
- **Yarn**: Used as the package manager.
- **Docker**: Version 17.12.0 or later.
- **VS Code Extensions**:
  - [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
  - [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)

---

## Getting Started

### Clone and Install Dependencies

1. Clone the repository:

   ```bash
   git clone https://github.com/progwise/george-ai.git
   ```

2. Navigate to the server directory and set up environment variables:

   ```bash
   cd apps/georgeai-server
   mv .env.example .env
   ```

3. Populate the `.env` file with the required API keys.

4. Return to the repository’s root folder and install dependencies:
   ```bash
   cd $(git rev-parse --show-toplevel)
   yarn
   ```

---

### Install Docker

#### Installing on Debian

Follow the [official Docker documentation](https://docs.docker.com/desktop/setup/install/linux/debian/) for installation instructions.

After installation, open VS Code and:

1. Press `Ctrl + Shift + P`.
2. Select **Dev Container: Rebuild and Reopen in Container**.

   ![alt text](devContainerScreenCaputre.png)

---

### Running the Server and Chat Interface

#### Start the Server

1. Navigate to the server directory:

   ```bash
   cd apps/georgeai-server
   ```

2. Install dependencies and start the server:

   ```bash
   yarn
   yarn start
   ```

3. The server should now be running at `http://localhost:3000`.

#### Start the Chat Interface

1. Navigate to the chat interface directory:

   ```bash
   cd $(git rev-parse --show-toplevel)/apps/chat-web
   ```

2. Install dependencies and start the development server:

   ```bash
   yarn
   yarn dev
   ```

3. Access the chat interface at `http://localhost:3001`.

#### Sending Messages via GraphiQL

You can test the chatbot using GraphiQL:

```graphql
mutation {
  chat(question: "What can I do in Greifswald?", sessionId: "v1") {
    answer
    source
  }
}
```

**Note:** The `source` field now indicates whether the answer came from the local PDF (`"local"`), a web-based retrieval (`"web"`), or the model’s own reasoning (`"model"`).

---

## Modifying the Chat Bot Agent

To modify the chatbot’s retrieval and reasoning logic, go to the source directory:

```bash
cd $(git rev-parse --show-toplevel)/packages/langchain-chat/src
```

Here, you can find the main TypeScript files:

- `index.ts`
- `main-chain.ts`
- `message-history.ts`
- `pdf-vectorstore.ts`
- `prompts.ts`
- `web-vectorstore.ts`

These files define how the chatbot retrieves context from the PDF, when it resorts to web search, and how it falls back to model reasoning. Adjusting these prompts and chains can further fine-tune the agent’s behavior.
