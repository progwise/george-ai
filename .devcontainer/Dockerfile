FROM mcr.microsoft.com/devcontainers/javascript-node:22

RUN apt-get update \
  && apt-get -y install --no-install-recommends  \
    libcairo2-dev \
    libjpeg62-turbo-dev \
    libpango1.0-dev \
    libgif-dev build-essential \
    g++ \
    python3-pip \
    python3-venv \
    smbclient \
    curl \
    gpg \
    cifs-utils \
    postgresql-client

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update \
  && apt-get install -y gh

# Install mob.sh
RUN curl -sL https://raw.githubusercontent.com/remotemobprogramming/mob/refs/heads/main/install.sh | sh

ARG TARGETARCH

# Install NATS CLI version 0.0.35
RUN export NATS_VERSION="0.0.35" && \
    # Map Docker's architecture names to NATS release names
    if [ "$TARGETARCH" = "amd64" ]; then ARCH="amd64"; \
    elif [ "$TARGETARCH" = "arm64" ]; then ARCH="arm64"; \
    else ARCH="amd64"; fi && \
    curl -L "https://github.com/nats-io/natscli/releases/download/v${NATS_VERSION}/nats-${NATS_VERSION}-linux-${ARCH}.zip" -o nats.zip && \
    unzip nats.zip && \
    mv nats-${NATS_VERSION}-linux-${ARCH}/nats /usr/local/bin/ && \
    rm -rf nats.zip nats-${NATS_VERSION}-linux-${ARCH}

ENV PNPM_VERSION=9.15.4
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

RUN mkdir -p /workspaces/george-ai && chown -R node:node /workspaces/george-ai

# Ensure the pnpm home and workspace exist and are owned by node
RUN mkdir -p /home/node/.local/share/pnpm /workspaces/george-ai && \
    chown -R node:node /home/node /workspaces/george-ai

USER node

ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKDIR /workspaces/george-ai
# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"
