# George AI Project

## Table of Contents

- [George AI Project](#george-ai-project)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [Clone and Install Dependencies](#clone-and-install-dependencies)
  - [Install Docker](#install-docker)
    - [Debian](#debian)

## Prerequisites

- Node.js version 20 is required for this project.
- This project currently uses yarn as the package manager.

## Getting Started

### Clone and Install Dependencies

1. Clone the repository
2. ```bash
   cd apps/george-ai-server
   mv .env.example .env
   ```

3. fill the .env file with the API keys.
4. get back to the root folder and run the following commands:

```bash
cd ../..
yarn
```

Then you will need to install docker version 17.12.0 or later and vscode extension "Remote - Containers" and "Remote - SSH" to run the project in a container.

## Install Docker

### Debian

to install docker on [Debian](https://docs.docker.com/desktop/setup/install/linux/debian/)

Then, in your vscode press `ctrl + shift + p' and select "Dev Container: Rebuid and Reopen in Container" just like the image below:

![alt text](<Screenshot from 2024-12-01 16-57-47.png>)

Then do the following steps:

```bash
cd apps/george-ai-server
yarn
yarn start
```
