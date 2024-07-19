# Welcome to Remix!

- 📖 [Remix docs](https://remix.run/docs)

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.

# Server and API requests handling. George JS-CHAT-API

## Description

A brief description of the project, its purpose, and its main features.

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)

### Installing Node.js and npm

To install Node.js and npm, follow these steps:

#### For Windows and macOS:

1. Download the Node.js installer from [nodejs.org](https://nodejs.org/en).
2. Run the installer and follow the prompts.
3. Verify the installation by running the following commands in your terminal:

```bash
node -v
npm -v
```

#### For Linux:

1. Update your package list:

```bash
sudo apt update
```

2. Install Node.js and npm:

```bash
sudo apt install nodejs npm
```

3. Verify the installation:

```bash
node -v
npm -v
```

## Steps to Set Up the Project

### 1. Clone the Repository

```bash
git clone https://github.com/splendidcomputer/langchain-api.git
cd langchain-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory of the project and add the necessary environment variables. For example:

```plaintext
OPENAI_API_KEY=sk-????????
TAVILY_API_KEY=tvly-???????
```

### 4. Run the Server

```bash
node server.js
```

## Example Use Case of the REST API using Curl

### Create a Chat

```bash
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"input": "What does Pascal Helbig do in Progwise?"}'
```
