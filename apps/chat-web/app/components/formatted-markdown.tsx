import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const FormattedMarkdown = ({
  markdown,
}: {
  markdown: string | undefined | null
}) => {
  return (
    <div className="prose marker:text-base-100 [&_*]:text-base-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  )
}
