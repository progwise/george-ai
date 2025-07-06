import { useTranslation } from '../../../i18n/use-translation-hook'
import { FormattedMarkdown } from '../../formatted-markdown'

export const FileContent = ({ markdown }: { markdown: string }) => {
  const { t } = useTranslation()
  console.log('FileContent component rendered with markdown:', markdown)
  return (
    <div>
      <h3 className="text-lg font-bold">{t('files.view')}</h3>
      <div>
        <FormattedMarkdown markdown={markdown} className="text-sm font-semibold" />
      </div>
    </div>
  )
}
