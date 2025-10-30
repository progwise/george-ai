# Keycloak Configuration Guide

Keycloak handles authentication for George AI. This guide covers essential setup for development and production.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [OAuth Identity Providers (Optional)](#oauth-identity-providers-optional)
- [Avatar Configuration (Optional)](#avatar-configuration-optional)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Access Keycloak Admin Console

| Environment | URL                         | Username | Password                               |
| ----------- | --------------------------- | -------- | -------------------------------------- |
| Development | http://localhost:8180       | admin    | admin                                  |
| Production  | From `KEYCLOAK_URL` in .env | admin    | From `KEYCLOAK_ADMIN_PASSWORD` in .env |

### 2. Import Realm

1. Click **Create Realm** (or realm dropdown in top-left)
2. Click **Browse** → select `docs/examples/keycloak-george-ai-realm.json`
3. Click **Create**

**What's included:**

- ✅ Pre-configured `george-ai-web` client with localhost redirect URIs
- ✅ `avatar_url` client scope mapper (for user avatars)
- ✅ Default roles and authentication flows
- ❌ No OAuth providers (add manually if needed)
- ❌ No users (create in step 4)

### 3. Update Client Redirect URIs

Go to **Clients** → **george-ai-web** → **Settings** and update:

| Setting                             | Development                                           | Production                                              |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| **Valid Redirect URIs**             | `http://localhost:3001/*`<br/>`http://localhost:3001` | `https://yourdomain.com/*`<br/>`https://yourdomain.com` |
| **Valid Post Logout Redirect URIs** | Same as above                                         | Same as above                                           |
| **Web Origins**                     | `http://localhost:3001`                               | `https://yourdomain.com`                                |

### 4. Create User

1. **Users** → **Add User**
2. Fill in: Username, Email, First Name, Last Name
3. Enable **Email Verified** toggle → **Create**
4. **Credentials** tab → **Set Password** → Set **Temporary** to **Off** → **Save**

**You're done!** George AI can now authenticate users.

---

## Environment Configuration

### Required Variables

| Variable                  | Development               | Production                            |
| ------------------------- | ------------------------- | ------------------------------------- |
| `KEYCLOAK_URL`            | `http://localhost:8180`   | `https://keycloak.yourdomain.com`     |
| `KEYCLOAK_REALM`          | `george-ai`               | `george-ai`                           |
| `KEYCLOAK_CLIENT_ID`      | `george-ai-web`           | `george-ai-web` or `george-ai-client` |
| `KEYCLOAK_REDIRECT_URL`   | `http://localhost:3001`   | `https://yourdomain.com`              |
| `KEYCLOAK_ADMIN_PASSWORD` | `admin` (devcontainer)    | **Strong password (32+ chars)**       |
| `KEYCLOAK_DB_PASSWORD`    | `password` (devcontainer) | **Strong password (32+ chars)**       |

### Production Security Checklist

- ✅ Use HTTPS with valid SSL certificates
- ✅ Strong admin password (32+ characters)
- ✅ Strong database password
- ✅ Restrict admin console access (firewall/VPN)
- ✅ Regular Keycloak updates
- ✅ Regular database backups

### Reverse Proxy (Production)

If using Nginx/Caddy/Traefik, configure Keycloak environment:

```yaml
# docker-compose.yml
keycloak:
  environment:
    KC_PROXY: edge
    KC_HOSTNAME: keycloak.yourdomain.com
    KC_HOSTNAME_STRICT: 'true'
    KC_HOSTNAME_STRICT_HTTPS: 'true'
```

See [Self-Hosting Guide](./self-hosting.md) for complete reverse proxy examples.

---

## OAuth Identity Providers (Optional)

Enable social login with Google, GitHub, or LinkedIn.

### Setup Pattern

For each provider:

1. **Create OAuth app** at provider's developer console
2. Configure **redirect URI**: `{KEYCLOAK_URL}/realms/george-ai/broker/{provider}/endpoint`
3. In Keycloak: **Identity Providers** → **Add provider** → Select provider
4. Enter **Client ID** and **Client Secret**
5. Click **Save**

### Provider-Specific Configuration

| Provider     | Redirect Endpoint                             | Required Scopes        | Setup Guide                                                                                                           | Notes                 |
| ------------ | --------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Google**   | `.../broker/google/endpoint`                  | `openid profile email` | [Setup Guide](https://support.google.com/cloud/answer/6158849)                                                        | Enable Google+ API    |
| **GitHub**   | `.../broker/github/endpoint`                  | `user:email read:user` | [Setup Guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)                   | -                     |
| **LinkedIn** | `.../broker/linkedin-openid-connect/endpoint` | `openid profile email` | [Setup Guide](https://techdocs.akamai.com/identity-cloud/docs/the-linkedin-oauth-20-social-login-configuration-guide) | Requires Company Page |

**Example redirect URIs:**

- Development: `http://localhost:8180/realms/george-ai/broker/google/endpoint`
- Production: `https://keycloak.yourdomain.com/realms/george-ai/broker/google/endpoint`

---

## Avatar Configuration (Optional)

Configure Keycloak to include user avatars from OAuth providers in JWT tokens.

### Setup (One-time)

**Step 1: Configure Client Scope Mapper** (do this once for all providers)

1. **Client Scopes** → **profile** → **Mappers** tab
2. **Add mapper** → **By configuration** → **User Attribute**
3. Configure:
   - **Name**: `avatar_url`
   - **User Attribute**: `avatar_url`
   - **Token Claim Name**: `avatar_url`
   - **Claim JSON Type**: `String`
   - **Add to ID token**: `On`
   - **Add to access token**: `On`
   - **Add to userinfo**: `On`
4. **Save**

**Step 2: Configure Identity Provider Mappers** (for each OAuth provider)

1. **Identity Providers** → **[Provider]** → **Settings** tab
2. Set **Sync Mode**: `force` (always update avatar on login)
3. Click **Mappers** tab → **Add mapper**
4. Configure based on provider:

| Provider | Mapper Name       | JSON Field Path |
| -------- | ----------------- | --------------- |
| Google   | `google-avatar`   | `picture`       |
| GitHub   | `github-avatar`   | `avatar_url`    |
| LinkedIn | `linkedin-avatar` | `picture`       |

**Common settings for all mappers:**

- **Mapper Type**: `Attribute Importer`
- **User Attribute Name**: `avatar_url`

**Step 3: Verify**

1. **Clients** → **george-ai-web** → **Client Scopes**
2. Ensure `profile` is in **Assigned Default Client Scopes**

---

## Troubleshooting

### Keycloak Not Accessible

```bash
# Check health
curl http://localhost:8180/health/ready

# Check logs
docker compose logs keycloak
```

**Common issues:**

- Database not ready → Wait for health check
- Port conflict → Check port 8180
- Wrong password → Verify `KEYCLOAK_ADMIN_PASSWORD`

### Redirect URI Mismatch

**Error:** `Invalid parameter: redirect_uri`

**Solution:**

1. Verify `KEYCLOAK_REDIRECT_URL` in `.env` matches actual URL
2. Update client redirect URIs to include all possible URLs
3. Check browser console for exact redirect_uri being used
4. Remove trailing slashes

### User Cannot Login

**Check:**

- User exists and has password set (Credentials tab)
- Email verified is enabled
- Realm name matches `KEYCLOAK_REALM` in `.env`
- Client ID matches `KEYCLOAK_CLIENT_ID` in `.env`

### OAuth Provider Fails

| Provider     | Common Issues                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **Google**   | Google+ API not enabled<br/>Redirect URI mismatch<br/>Invalid Client Secret                               |
| **GitHub**   | Callback URL mismatch<br/>Missing `user:email` scope<br/>Expired Client Secret                            |
| **LinkedIn** | "Sign In with LinkedIn" not approved<br/>No Company Page<br/>Wrong endpoint (`/linkedin-openid-connect/`) |

### Avatar Not Showing

**Check:**

1. Identity Provider mapper configured with correct JSON path (see table above)
2. Client Scope mapper exists for `avatar_url`
3. `profile` scope in client's default scopes
4. Sync Mode set to `force`

**Debug:** Go to **Users** → **[User]** → **Attributes** → Verify `avatar_url` exists

---

## Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Developer Setup Guide](./developer-setup.md) - Development environment
- [Self-Hosting Guide](./self-hosting.md) - Production deployment
- [Keycloak Realm Export](./examples/keycloak-george-ai-realm.json) - Pre-configured realm
