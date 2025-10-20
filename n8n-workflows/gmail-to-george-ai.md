# Gmail to George AI Workflow

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

- **Automatic Mode**: Polls Gmail every minute for new emails
- **Manual Mode**: Click "Execute workflow" to bulk import recent emails (up to 10 at a time)
- Automatic duplicate detection
- Email body as RFC822 .eml with MIME headers
- Attachments uploaded with base64 encoding
- Files grouped by URI: `email:{mailbox}/{messageId}/`

## Workflow

**Automatic Mode:**

```
Gmail Trigger (every minute) → Set Config → Extract Metadata → Check Duplicate
  → Filter New → [Email Body + Attachments] → Register → Upload
```

**Manual Mode (for testing/bulk import):**

```
Manual Trigger → Get many messages (up to 10) → Set Config → ...same as above
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

**Bulk import limit:** Edit "Get many messages" node → Limit (default: 10, max depends on Gmail API quotas)

**Multiple mailboxes:** Duplicate workflow with different Gmail credentials

## Usage Tips

**For Initial Import:**

1. Use the Manual Trigger to bulk import recent emails
2. Increase the "limit" in "Get many messages" node (e.g., 50)
3. Click "Execute workflow" to run once
4. After initial import, activate the workflow for automatic polling

**For Testing:**

- Use Manual Trigger instead of waiting for Gmail polling
- Check execution log to debug issues
- Verify duplicate detection is working correctly

## Security

- Generate separate API keys per workflow
- Never commit API keys
- Use HTTPS in production
- Revoke unused keys immediately
