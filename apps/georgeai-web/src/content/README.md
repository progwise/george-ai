# Blog Author Guide

Welcome to the George AI blog! This guide will help you create high-quality blog posts that drive SEO and establish thought leadership in LLM context management and self-hosted AI.

## Table of Contents

- [Quick Start](#quick-start)
- [File Format](#file-format)
- [Frontmatter Schema](#frontmatter-schema)
- [Draft vs Published](#draft-vs-published)
- [Writing in MDX](#writing-in-mdx)
- [Using Components](#using-components)
- [Images and Assets](#images-and-assets)
- [SEO Best Practices](#seo-best-practices)
- [Preview and Testing](#preview-and-testing)
- [Publishing Workflow](#publishing-workflow)

---

## Quick Start

1. **Create a new file** in `src/content/blog/` directory
2. **Choose format**: `.md` (Markdown) or `.mdx` (MDX with components)
3. **Add frontmatter** (see schema below)
4. **Write content** using Markdown
5. **Preview locally**: `pnpm dev` and visit `/blog`
6. **Publish**: Set `draft: false` and push to main branch

---

## File Format

### File Naming Convention

Use **kebab-case** with descriptive, SEO-friendly names:

```
✅ Good:
- why-rag-pipelines-fail-context-quality.md
- self-hosted-ai-vs-cloud-comparison.mdx
- optimizing-llm-context-windows.md

❌ Bad:
- blog1.md
- My Post.md
- 2025-01-11-post.md (no dates in filename)
```

**Why?** The filename becomes the URL slug: `/blog/your-filename`

### File Extensions

- **`.md`** - Standard Markdown (simple posts)
- **`.mdx`** - MDX (Markdown + JSX components, videos, interactive content)

---

## Frontmatter Schema

Every blog post must start with YAML frontmatter:

```yaml
---
title: 'Your Blog Post Title (50-60 chars for SEO)'
description: 'Meta description for search engines (150-160 chars). Summarize the post and include target keywords.'
pubDate: 2025-01-11
updatedDate: 2025-01-15 # Optional - use when updating content
heroImage: '/images/blog/your-hero-image.svg' # Optional
author: 'Michael Vogt' # Default, can override
tags: ['RAG', 'Self-Hosted AI', 'LLM Context', 'Vector Search']
draft: true # Set to false when ready to publish
featured: false # Set to true for homepage featured posts
---
```

### Field Descriptions

| Field         | Type    | Required | Description                                        |
| ------------- | ------- | -------- | -------------------------------------------------- |
| `title`       | string  | ✅       | Post title (50-60 chars optimal for SEO)           |
| `description` | string  | ✅       | Meta description (150-160 chars, include keywords) |
| `pubDate`     | date    | ✅       | Publication date (YYYY-MM-DD format)               |
| `updatedDate` | date    | ❌       | Last update date (shows "Updated on" badge)        |
| `heroImage`   | string  | ❌       | Hero image path (relative to `/public`)            |
| `author`      | string  | ❌       | Author name (defaults to "Michael Vogt")           |
| `tags`        | array   | ✅       | Post tags (4-6 tags recommended)                   |
| `draft`       | boolean | ❌       | Draft status (defaults to `false`)                 |
| `featured`    | boolean | ❌       | Featured post flag (defaults to `false`)           |

---

## Draft vs Published

### How Drafts Work

**Development (`pnpm dev`):**

- ✅ All posts visible on `/blog` index (including drafts)
- ✅ All posts accessible via direct URL
- 🎯 **Purpose:** Preview and test your draft posts

**Production (deployed site):**

- ✅ Published posts (`draft: false`) shown on `/blog` index
- ✅ Published posts accessible via URL
- ✅ Published posts included in sitemap.xml
- ❌ Draft posts (`draft: true`) **not generated at all**
- ❌ Draft posts **not accessible** (404 error)
- ❌ Draft posts **not in sitemap** (won't be indexed by search engines)

### Draft Protection in Production

In production builds, draft posts are completely excluded:

- **No Page Generation:** Draft posts don't generate HTML pages
- **No Sitemap Inclusion:** Search engines won't discover them
- **404 for Direct URLs:** Even if someone knows the slug, they get 404
- **SEO Safe:** Prevents accidental indexing of unfinished content

This ensures drafts remain truly private until you're ready to publish.

### Publishing a Post

**Before publishing, ensure:**

1. **Replace all placeholders** in your draft:
   - `VIDEO_ID_HERE` → actual YouTube video ID
   - `IMAGE_URL_HERE` → actual image paths
   - Any `TODO` comments or temporary content
2. **Set `draft: false`** in frontmatter
3. **Verify `pubDate`** is correct
4. **Push to main branch**
5. **Deploy** (automatic on push)

**The post will now:**

- ✅ Appear on `/blog` index
- ✅ Be included in RSS feed (`/rss.xml`)
- ✅ Be indexed by search engines

---

## Writing in MDX

MDX allows you to use React components inside Markdown. This enables interactive content, embeds, and custom layouts.

### Basic Markdown

```markdown
# Heading 1

## Heading 2

### Heading 3

**Bold text** and _italic text_

- Bullet list
- Another item

1. Numbered list
2. Another item

[Link text](https://example.com)

![Alt text](/images/blog/image.svg)
```

### Code Blocks

````markdown
```javascript
// Syntax highlighting supported
const example = 'Hello World'
console.log(example)
```

```typescript
interface User {
  name: string
  email: string
}
```

```bash
# Shell commands
pnpm install
pnpm dev
```
````

### Callouts and Quotes

```markdown
> This is a blockquote
> Great for highlighting important information

**Pro Tip:** Use bold text for inline callouts
```

---

## Using Components

MDX files (`.mdx`) can use custom components.

### YouTube Videos

Embed YouTube videos:

```mdx
---
title: 'My Post with Video'
# ... other frontmatter
---

import YouTube from '../../components/blog/YouTube.astro'

## Watch the Demo

<YouTube id="dQw4w9WgXcQ" title="Getting Started with George AI" />

The video ID is from the URL: `youtube.com/watch?v=dQw4w9WgXcQ`
```

**Props:**

- `id` (required): YouTube video ID
- `title` (required): Accessible title for screen readers

### Creating New Components

1. Create component in `src/components/blog/`
2. Import in your `.mdx` file
3. Use it like any JSX component

**Example: Custom Alert Component**

```astro
<!-- src/components/blog/Alert.astro -->
---
interface Props {
  type: 'info' | 'warning' | 'success'
  children: any
}
const { type = 'info' } = Astro.props
---
<div class={`alert alert-${type} mb-4`}>
  <slot />
</div>
```

```mdx
import Alert from '../../components/blog/Alert.astro'

<Alert type="warning">This is a warning message!</Alert>
```

---

## Images and Assets

### Where to Store Images

```
apps/georgeai-web/public/images/blog/
├── hero-images/          # Hero images for posts
├── post-images/          # Inline images for content
└── diagrams/             # Architecture diagrams, charts
```

### Image Best Practices

**Hero Images:**

- Dimensions: 1200×630px (optimal for social sharing)
- Format: PNG, JPG, or SVG
- File size: < 200KB (optimize for web)
- Path: `/images/blog/hero-images/your-post-hero.svg`

**Inline Images:**

- Use descriptive filenames: `rag-pipeline-diagram.svg`
- Optimize file size (< 100KB for each image)
- Add meaningful alt text for accessibility

**Example:**

```markdown
---
heroImage: '/images/blog/hero-images/rag-pipelines.svg'
---

## Architecture Overview

![RAG pipeline architecture showing document ingestion, chunking, and retrieval](/images/blog/diagrams/rag-pipeline-architecture.svg)
```

### Creating Hero Images

Use tools like:

- **Figma** - Design custom graphics
- **Excalidraw** - Hand-drawn diagrams
- **Canva** - Quick social media graphics

**Template:** 1200×630px with George AI branding colors

---

## SEO Best Practices

### Title Optimization

```yaml
# ✅ Good: Clear, keyword-rich, 50-60 chars
title: 'Why RAG Pipelines Fail: Context Quality Over Vector Similarity'

# ❌ Bad: Vague, too short
title: 'RAG Problems'

# ❌ Bad: Too long (truncated in search results)
title: 'A Comprehensive Deep Dive Into Why Retrieval-Augmented Generation Pipelines Often Fail'
```

### Description Optimization

```yaml
# ✅ Good: Compelling, keyword-rich, 150-160 chars
description: 'Most RAG pipelines prioritize vector similarity over context quality. Learn why LLM context management matters more than your vector database for production AI systems.'

# ❌ Bad: Too short, no keywords
description: 'Learn about RAG pipelines.'

# ❌ Bad: Too long (truncated)
description: 'This is a very long description that goes into way too much detail...'
```

### Keyword Strategy

**Primary Keywords** (use in title, description, H1):

- self-hosted AI
- LLM context management
- RAG pipeline
- vector search
- document AI

**Secondary Keywords** (use in H2, H3, content):

- context window optimization
- semantic search
- document processing
- AI knowledge base
- enterprise AI

**Long-tail Keywords** (use naturally in content):

- "self-hosted alternative to Pinecone"
- "optimize LLM context window"
- "manage AI agent context"

### Heading Structure

```markdown
# Post Title (H1) - Only one per post, matches frontmatter title

## Main Section (H2) - Major topics

### Subsection (H3) - Supporting points

#### Minor Point (H4) - Rarely needed
```

**SEO Impact:**

- Clear hierarchy helps search engines understand structure
- Users can scan content easily
- Table of contents generates automatically from headings

### Internal Linking

Link to other George AI pages:

```markdown
Learn more about [George AI's architecture](/docs/architecture).

Compare [self-hosted vs cloud AI](/compare/self-hosted-vs-cloud-ai).

Explore [use cases for healthcare](/use-cases/healthcare).
```

**Benefits:**

- Keeps users on site (lower bounce rate)
- Distributes SEO value across pages
- Helps search engines discover content

---

## Preview and Testing

### Local Development

```bash
# Start dev server
cd /workspaces/george-ai
pnpm dev

# Visit blog
# Frontend: http://localhost:3001/blog
# Backend: http://localhost:3003
```

**Preview URLs:**

- Blog index: `http://localhost:3001/blog`
- Your post: `http://localhost:3001/blog/your-slug`
- RSS feed: `http://localhost:3001/rss.xml`

### Checklist Before Publishing

- [ ] **All placeholders replaced** (VIDEO_ID_HERE, IMAGE_URL_HERE, TODOs)
- [ ] Title is 50-60 characters
- [ ] Description is 150-160 characters
- [ ] Hero image is optimized (< 200KB)
- [ ] All internal links work
- [ ] Code blocks have syntax highlighting
- [ ] Images have descriptive alt text
- [ ] Tags are relevant and specific (4-6 tags)
- [ ] Frontmatter is valid (no YAML errors)
- [ ] Content is proofread (grammar, spelling)
- [ ] Post provides value (not just promotional)

### Testing Checklist

- [ ] Post renders correctly on desktop
- [ ] Post renders correctly on mobile
- [ ] Table of contents generates (if H2/H3 present)
- [ ] Hero image displays properly
- [ ] Code blocks are readable
- [ ] Tags display correctly
- [ ] Reading time is accurate
- [ ] Author bio shows at bottom

---

## Publishing Workflow

### Step 1: Create Draft

```yaml
---
title: 'Your Post Title'
description: 'Your meta description'
pubDate: 2025-01-11
tags: ['Tag1', 'Tag2']
draft: true # ← Keep as draft while writing
---
```

### Step 2: Review in Development

```bash
pnpm dev
# Visit http://localhost:3001/blog/your-slug
```

### Step 3: Get Feedback (Optional)

To share drafts with reviewers, you have two options:

**Option 1: Share Development Server (Local Network)**

```bash
pnpm dev --host
# Share your local IP: http://192.168.x.x:3001/blog/your-slug
```

**Option 2: Temporarily Publish**

```yaml
draft: false # Temporarily set to false
```

Push to production, get feedback, then set back to `draft: true` if needed.

### Step 4: Publish

```yaml
draft: false # ← Change to false
```

```bash
git add src/content/blog/your-post.md
git commit -m "feat(blog): add post about RAG pipeline optimization"
git push
```

### Step 5: Verify Deployment

After deployment:

- [ ] Post appears on `/blog` index
- [ ] Post is in RSS feed (`/rss.xml`)
- [ ] Social sharing works (Open Graph tags)
- [ ] Submit to Google Search Console (optional)

---

## Target Blog Topics (SEO Strategy)

From **Issue #839 - Priority 2 Task #4**:

1. **"What is RAG and Why Self-Hosted Matters"**
   - Keywords: self-hosted RAG, RAG pipeline, retrieval-augmented generation
   - Target: Developers exploring RAG solutions

2. **"Self-Hosted AI vs Cloud AI: Complete Comparison"**
   - Keywords: self-hosted AI platform, cloud AI comparison, enterprise AI
   - Target: Decision-makers evaluating AI infrastructure

3. **"Building AI Knowledge Base with George AI"**
   - Keywords: AI knowledge base, document AI, enterprise search
   - Target: Teams implementing knowledge management

4. **"Why LLM Context Management Matters More Than Your Vector Database"**
   - Keywords: LLM context management, vector database, AI context
   - Target: Technical audience optimizing AI systems

5. **"Optimizing Context Windows: From Raw Documents to Structured LLM Input"**
   - Keywords: context window optimization, LLM input, document processing
   - Target: AI engineers building production systems

---

## Additional Resources

### Documentation

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [MDX Documentation](https://mdxjs.com/)
- [Markdown Guide](https://www.markdownguide.org/)

### SEO Tools

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Meta Tags Preview](https://metatags.io/)

### Image Tools

- [Figma](https://www.figma.com/) - Design tool
- [Excalidraw](https://excalidraw.com/) - Diagram tool
- [TinyPNG](https://tinypng.com/) - Image compression
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - SVG optimization

---

## Questions or Issues?

- **Technical Issues:** Open issue in GitHub
- **Content Questions:** Contact Michael Vogt
- **SEO Strategy:** Review issue #839

---

**Happy Writing! 🎉**

Remember: Focus on providing value to readers. Great content naturally attracts links and ranks well in search engines.
