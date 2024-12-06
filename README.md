# George AI Project

**Welcome to the George AI Project!**

This project introduces a chatbot agent built using LangChain. It prioritizes retrieving information from local PDFs before resorting to web-based searches or model-generated content. The agent provides clear transparency by labeling its answers as **"local"**, **"web"**, or **"model"**, so you always know the source of its response.

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

## Prerequisites

Before you get started, ensure you have the following tools installed:

- **Node.js**: Version 20 or later.
- **Yarn**: Used as the package manager.
- **Docker**: Version 17.12.0 or later.
- **VS Code Extensions**:
  - [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
  - [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)

## Getting Started

### Clone and Install Dependencies

1. Clone the repository:

   ```bash
   git clone https://github.com/progwise/george-ai.git
   ```

2. Navigate to the server directory and set up the environment variables:

   ```bash
   cd apps/georgeai-server
   mv .env.example .env
   ```

3. Populate the `.env` file with the necessary API keys.

4. Return to the repository's root folder and install dependencies:

   ```bash
   cd $(git rev-parse --show-toplevel)
   yarn
   ```

### Install Docker

#### Installing on Debian

Follow the [official Docker documentation](https://docs.docker.com/desktop/setup/install/linux/debian/) for installation instructions.

Once installed, open VS Code and:

1. Press `Ctrl + Shift + P`.
2. Select **Dev Container: Rebuild and Reopen in Container**.

   ![alt text](devContainerScreenCaputre.png)

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

3. The server should now be running at `http://localhost:300X`.

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

You can also test the chatbot using GraphiQL:

```graphql
mutation {
  chat(question: "What can I do in Greifswald?", sessionId: "v1") {
    answer
    source
  }
}
```

**Note:** The `source` field specifies if the answer is derived from a local PDF (`"local"`), a web search (`"web"`), or the model's reasoning (`"model"`).

## Modifying the Chat Bot Agent

To customize the chatbot’s retrieval and reasoning logic, go to the source directory:

```bash
cd $(git rev-parse --show-toplevel)/packages/langchain-chat/src
```

The following TypeScript files define the chatbot’s behavior:

- `index.ts`
- `main-chain.ts`
- `message-history.ts`
- `pdf-vectorstore.ts`
- `prompts.ts`
- `web-vectorstore.ts`

These files control how the chatbot retrieves context from PDFs, when it turns to web-based retrieval, and how it uses model reasoning. Adjust the prompts and chains in these files to further fine-tune the agent’s behavior.
