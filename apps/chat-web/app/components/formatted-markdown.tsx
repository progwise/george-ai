import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const FormattedMarkdown = ({ markdown }: { markdown: string }) => {
  return (
    <div className="prose marker:text-base-100 [&_*]:text-base-100">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  )
}
