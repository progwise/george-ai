FROM mcr.microsoft.com/devcontainers/javascript-node:22

ENV PNPM_VERSION=9.15.4

RUN npm install -g pnpm@${PNPM_VERSION}

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
    cifs-utils

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update \
  && apt-get install -y gh

# Install mob.sh
RUN curl -sL https://raw.githubusercontent.com/remotemobprogramming/mob/refs/heads/main/install.sh | sh

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"
