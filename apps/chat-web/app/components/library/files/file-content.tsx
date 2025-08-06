import { FormattedMarkdown } from '../../formatted-markdown'

export const FileContent = ({
  markdown,
  sources,
}: {
  markdown: string
  sources: { fileName: string; link: string }[]
}) => {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="breadcrumbs text-sm">
        <ul>
          {sources.map((source) => (
            <li key={source.fileName}>
              <a className="link link-hover" href={source.link} target="_blank">
                {source.fileName}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <hr />
      <FormattedMarkdown markdown={markdown} className="text-sm font-semibold" />
    </div>
  )
}
