import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import rehypeStringify from 'rehype-stringify'
import remarkRehype from 'remark-rehype'

export const convertMdToHtml = (markdown: string) => {
  const html = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdown || '')
    .toString()
  return html
}
