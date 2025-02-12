import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export const FormattedMarkdown = ({ markdown }: { markdown: string }) => {
  return (
    <div className="prose marker:text-base-100 [&_*]:text-base-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

export const LoadingIndicator = () => (
  <span className="loading loading-dots loading-xs"></span>
)
