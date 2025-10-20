# Gmail to George AI - n8n Workflow

Automatically ingest Gmail emails and attachments into George AI libraries.

## Quick Setup

### 1. Prerequisites

- George AI running: `pnpm dev`
- n8n running: `http://localhost:5678`
- Library with API key generated

### 2. Configure Credentials in n8n

**George AI API Key (Header Auth):**

```
Name: Authorization
Value: Bearer YOUR_API_KEY
```

**Gmail OAuth2:** Connect your Google account

### 3. Import & Configure

1. Import `gmail-to-george-ai.json`
2. Edit **"Set Configuration"** node:
   - `libraryId`: Your library ID
   - `graphqlUrl`: `http://app:3003/graphql`
   - `uploadUrl`: `http://app:3003/upload`
3. Assign credentials to HTTP Request nodes
4. Activate workflow

## Features

- Polls Gmail every minute
- Automatic duplicate detection
- Email body as RFC822 .eml with MIME headers
- Attachments uploaded with base64 encoding
- Files grouped by URI: `email:{mailbox}/{messageId}/`

## Workflow

```
Gmail Trigger → Set Config → Extract Metadata → Check Duplicate
  → Filter New → [Email Body + Attachments] → Register → Upload
```

## Important: Docker Networking

n8n runs in Docker and **must use service names**, not `localhost`:

- ✅ `http://app:3003/graphql`
- ❌ `http://localhost:3003/graphql`

Your browser uses `localhost`, workflows use service names.

## Troubleshooting

**401 Unauthorized**

- Check `Bearer ` prefix in API key (with space)
- Use `http://app:3003/*` not `localhost`

**Gmail not fetching**

- Re-authenticate Gmail OAuth
- Enable Gmail API in Google Cloud Console

**Files not appearing**

- Verify `pnpm dev` is running
- Check backend logs for errors

**Empty email body**

- Ensure MIME headers in .eml file
- Verify `message/rfc822` converter installed

## Customization

**Polling interval:** Edit Gmail Trigger → Poll Times

**Email filters:**

```javascript
filters: {
  q: 'is:unread'
} // Only unread
filters: {
  q: 'from:sender@example.com'
} // Specific sender
```

**Multiple mailboxes:** Duplicate workflow with different Gmail credentials

## Security

- Generate separate API keys per workflow
- Never commit API keys
- Use HTTPS in production
- Revoke unused keys immediately
