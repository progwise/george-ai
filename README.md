# George AI

**Self-hosted AI data platform managed by business users**

George AI transforms documents from any source into searchable vectors and structured data. Business users configure crawlers, enrichments, and search - no coding required. Developers access everything via GraphQL API.

**What makes it different:**
- **Markdown-first**: All documents (PDFs, Excel, HTML) → unified Markdown → consistent processing
- **Dual output**: Searchable vectors (semantic search) + structured data (AI enrichments)
- **Business user managed**: Configure data collection, processing, and enrichment without developers
- **Self-hosted**: Your data, your infrastructure, local AI with Ollama

[Learn more about features and use cases →](https://george-ai.net)

## Quick Start

### Try with Docker Compose

```bash
# Clone the repository
git clone https://github.com/progwise/george-ai.git
cd george-ai

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker compose up -d

# Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:3003/graphql
# Keycloak Admin: http://localhost:8180
```

**First time setup:** After starting services, configure Keycloak authentication and run database migrations. See [Self-Hosting Guide](https://george-ai.net/docs/self-hosting) for detailed instructions.

### Developer Setup

For local development with DevContainer:

```bash
# Open in VS Code
code george-ai

# Reopen in DevContainer when prompted
# Or: Command Palette → "Dev Containers: Reopen in Container"
```

**Developer documentation:** See [docs/developer-setup.md](docs/developer-setup.md) for DevContainer setup and [docs/architecture.md](docs/architecture.md) for system design.

**User documentation:** Visit [george-ai.net/docs](https://george-ai.net/docs) for features, self-hosting guide, and API reference.

## Community & Support

- 💬 **Questions & Discussions**: Join our [Discord server](https://discord.gg/5XP8f2Qe)
- 🐛 **Bug Reports**: [Create a GitHub Issue](https://github.com/progwise/george-ai/issues/new)
- ✨ **Feature Requests**: [Create a GitHub Issue](https://github.com/progwise/george-ai/issues/new)

**Please use GitHub Issues only for actionable bugs and feature requests. For general questions, ideas, and discussions, join our Discord community!**

---

## License

George-AI is licensed under the [Business Source License 1.1](LICENSE).

**Key Points:**

- ✅ Source code is publicly available
- ✅ Free for internal and non-commercial use
- ✅ Self-hosting permitted for non-commercial purposes
- ❌ Cannot be used to offer competing commercial SaaS services
- 🔄 Automatically converts to Apache 2.0 on 2029-01-01

**Proprietary Content:**

- Enterprise modules (SSO, Multi-Tenant, Audit Logs, SLA components)
- Marketing materials (apps/marketing-web)

For commercial licensing or questions, please contact: info@george-ai.net

**More Information:**

- Full license text: [LICENSE](LICENSE)
- BSL 1.1 FAQ: https://mariadb.com/bsl-faq-mariadb/
