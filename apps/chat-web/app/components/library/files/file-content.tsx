import { useTranslation } from '../../../i18n/use-translation-hook'
import { FormattedMarkdown } from '../../formatted-markdown'

export const FileContent = ({
  markdown,
  sources,
}: {
  markdown: string | null
  sources: { fileName: string; link: string }[]
}) => {
  const { t } = useTranslation()
  console.log('FileContent', sources)
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>{t('files.sources')}</li>
          {sources.length < 1 && <li>t{'files.noSourcesAvailable'}</li>}
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
      <FormattedMarkdown markdown={markdown || t('files.noContentAvailable')} className="text-sm font-semibold" />
    </div>
  )
}
