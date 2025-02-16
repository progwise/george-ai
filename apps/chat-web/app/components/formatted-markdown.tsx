import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const FormattedMarkdown = ({ markdown }: { markdown: string }) => {
  return (
    <div className="prose marker:text-base-100 [&_*]:text-base-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  )
}

export const LoadingIndicator = () => {
  return (
    <div className="chat-bubble opacity-50 text-center">
      <span className={`loading loading-dots loading-xs {className}`}></span>
    </div>
  )
}
