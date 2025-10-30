# Security Policy

## Supported Versions

We actively support the latest version from the `main` branch with security updates.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in George AI, please report it responsibly:

### How to Report

Send an email to **info@george-ai.net** with:

- Description of the vulnerability
- Location in the codebase
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge your report and work on a fix. You will be credited for the discovery if you wish.

### Coordinated Disclosure

We follow a coordinated disclosure process:

1. You report the vulnerability privately
2. We investigate and develop a fix
3. We release a patch and security advisory
4. We publicly disclose the vulnerability after a fix is available

We request a reasonable embargo period to fix the issue before public disclosure.

## Security Best Practices for Self-Hosting

If you're self-hosting George AI, follow these essential security practices:

### Essential Security

- **Strong Passwords**: Use secure passwords for all services (DB, Keycloak, Typesense, API keys)
- **HTTPS**: Always use SSL/TLS in production with a reverse proxy (Nginx, Traefik, Caddy)
- **Firewall**: Restrict access to only necessary ports
- **Updates**: Keep Docker images and dependencies up to date
- **Secrets**: Never commit `.env` files to version control

### Recommended Security

- Use Docker networks to isolate services
- Enable multi-factor authentication in Keycloak
- Configure security headers in your reverse proxy
- Regular automated backups with encryption
- Monitor logs for suspicious activity

For detailed security configuration, see [Self-Hosting Guide](../docs/self-hosting.md#security-best-practices).

## Data Privacy

George AI processes potentially sensitive data (files, embeddings, metadata). When using external AI services:

- Data may be sent to external APIs (OpenAI, etc.)
- Consider on-premises AI (Ollama) for sensitive data
- Review AI provider data retention policies
- For EU AI Act considerations, see [AI Act Package](../packages/ai-act/README.md)

## Contact

For security-related questions:

- **Email**: info@george-ai.net
- **Discord**: https://discord.gg/5XP8f2Qe (general questions only, NOT for reporting vulnerabilities)

---

Thank you for helping keep George AI secure!
