import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const parseFrontmatter = (markdown: string): { data: Record<string, string>; content: string } => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { data: {}, content: markdown }
  const data = Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.match(/^([^:]+):\s*(.*)$/))
      .filter(Boolean)
      .map((m) => [m![1].trim(), m![2].trim()]),
  )
  return { data, content: markdown.slice(match[0].length) }
}

const frontmatterToHtml = (data: Record<string, string>) => {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
    .join('')
  return `<table class="frontmatter-meta not-prose text-xs border rounded mb-4 w-full"><tbody>${rows}</tbody></table>`
}

export const convertMdToHtml = (markdown: string) => {
  const { data, content } = parseFrontmatter(markdown || '')
  const hasFrontmatter = Object.keys(data).length > 0

  const bodyHtml = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize) // Sanitize HTML to prevent XSS
    .use(rehypeStringify)
    .processSync(content)
    .toString()
  return hasFrontmatter ? frontmatterToHtml(data) + bodyHtml : bodyHtml
}
