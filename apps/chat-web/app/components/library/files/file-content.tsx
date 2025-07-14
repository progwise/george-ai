import { FormattedMarkdown } from '../../formatted-markdown'

export const FileContent = ({ markdown }: { markdown: string }) => {
  return (
    <div className="card bg-base-100 shadow-sm">
      <FormattedMarkdown markdown={markdown} className="text-sm font-semibold" />
    </div>
  )
}
