# George AI Documentation

Welcome to the George AI documentation! This directory contains comprehensive guides for developers, contributors, and self-hosters.

> **👤 Looking for user documentation?** Visit **[george-ai.net/docs](https://george-ai.net/docs)** for guides on using George AI (libraries, file uploads, crawlers, enrichments, AI assistants, etc.)

---

## 📚 Documentation Index

### Getting Started

**New to George AI?** Start here:

1. **[Architecture](./architecture.md)** - Understand how George AI works
   - High-level architecture with Mermaid diagrams
   - Applications and core packages
   - Document processing flow
   - Development workflows

2. **[Developer Setup](./developer-setup.md)** - Set up your development environment
   - DevContainer setup
   - Environment configuration
   - Keycloak configuration
   - Database migrations
   - Docker build verification

### For Self-Hosters

**Want to deploy George AI?**

- **[Self-Hosting Guide](./self-hosting.md)** - Complete deployment guide
  - System requirements
  - Quick start with Docker Compose
  - Configuration reference
  - Deployment scenarios (single-server, multi-server, Kubernetes)
  - Backup/restore procedures
  - Monitoring and logging
  - Security best practices
  - Troubleshooting

### For Contributors

**Want to contribute code?**

1. **[Contributing Guide](../.github/CONTRIBUTING.md)** - How to contribute
   - Code of conduct
   - Development workflow
   - Pull request process
   - Commit message guidelines

2. **[Code Patterns](./patterns.md)** - Code conventions and best practices
   - Form validation patterns
   - GraphQL/Pothos patterns
   - React patterns (hooks, modals, routing)
   - UI patterns (toast, styling, icons)

3. **[Architecture](./architecture.md)** - Deep dive into the system
   - Development workflows
   - GraphQL schema generation
   - Authentication flow

### Additional Resources

- **[Docker Build Guide](./docker.md)** - Building and running Docker images
- **[Keycloak Configuration](./keycloak.md)** - Authentication setup (development & production)

## 🎯 Quick Start by Role

### 👨‍💻 Developer (Contributing Code)

1. Read [Developer Setup](./developer-setup.md)
2. Review [Architecture](./architecture.md)
3. Study [Code Patterns](./patterns.md)
4. Check [Contributing Guide](../.github/CONTRIBUTING.md)

**Start coding!** Remember to run `pnpm format`, `pnpm typecheck`, and `pnpm lint` before committing.

### 🚀 Self-Hoster (Deploying George AI)

1. Read [Architecture](./architecture.md) (optional, but recommended)
2. Follow [Self-Hosting Guide](./self-hosting.md)
3. Review [Security Best Practices](./self-hosting.md#security-best-practices)

**Deploy!** Use the example `docs/examples/docker-compose.yml` for quick deployment.

### 🔧 Platform Administrator

1. Review [Self-Hosting Guide](./self-hosting.md)
2. Set up [Monitoring and Logging](./self-hosting.md#monitoring-and-logging)
3. Implement [Backup Procedures](./self-hosting.md#backup-and-restore)
4. Review [Upgrade Procedures](./self-hosting.md#upgrade-procedures)

**Monitor and maintain!** Regular backups and updates are crucial.

### 📖 End User (Using George AI)

Visit the **[User Documentation](https://george-ai.net/docs)** on the George AI website for guides on:

- Creating libraries
- Uploading files
- Configuring crawlers
- Setting up enrichments
- Using AI assistants

## 🔗 External Links

### GitHub Community

- **[Code of Conduct](../.github/CODE_OF_CONDUCT.md)** - Community guidelines
- **[Security Policy](../.github/SECURITY.md)** - Reporting vulnerabilities
- **[Issue Templates](../.github/ISSUE_TEMPLATE/)** - Bug reports, feature requests
- **[Pull Request Template](../.github/pull_request_template.md)** - PR checklist

### Online Resources

- **Website**: https://george-ai.net
- **User Docs**: https://george-ai.net/docs
- **GitHub**: https://github.com/progwise/george-ai
- **Discord**: https://discord.gg/5XP8f2Qe
- **License**: [Business Source License 1.1](../LICENSE)

## 📋 Documentation Overview

| Document                                   | Purpose                        | Audience                 |
| ------------------------------------------ | ------------------------------ | ------------------------ |
| [architecture.md](./architecture.md)       | System architecture and design | All                      |
| [developer-setup.md](./developer-setup.md) | Development environment setup  | Developers               |
| [self-hosting.md](./self-hosting.md)       | Deployment and configuration   | Self-hosters             |
| [keycloak.md](./keycloak.md)               | Keycloak authentication setup  | Developers, Self-hosters |
| [patterns.md](./patterns.md)               | Code conventions and patterns  | Contributors             |
| [contributing.md](./contributing.md)       | Contribution guidelines        | Contributors             |
| [docker.md](./docker.md)                   | Docker build instructions      | Developers               |

## 🤝 Getting Help

- **Questions?** Join our [Discord community](https://discord.gg/5XP8f2Qe)
- **Bug reports?** Open an [issue on GitHub](https://github.com/progwise/george-ai/issues)
- **Security concerns?** See our [Security Policy](../.github/SECURITY.md)

## 📝 Contributing to Documentation

Found an error or want to improve the docs? We welcome contributions!

1. Fork the repository
2. Edit the relevant documentation file
3. Submit a pull request

See [Contributing Guide](../.github/CONTRIBUTING.md) for details.

---

**Last Updated**: 2025-10-30
**George AI Version**: Development (main branch)
