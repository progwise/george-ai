import { FormattedMarkdown } from '../../formatted-markdown'

export const FileContent = ({ markdown, sources }: { markdown: string; sources: string[] }) => {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div>{sources.join(',')}</div>
      <FormattedMarkdown markdown={markdown} className="text-sm font-semibold" />
    </div>
  )
}
