import { graphql } from '../../../gql'
import { AiLibraryFile_FileContentFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { FormattedMarkdown } from '../../formatted-markdown'

export const FileContentResultFragmentDoc = graphql(`
  fragment AiLibraryFile_FileContent on AiLibraryFile {
    markdown
  }
`)

interface FileContentProps {
  file: AiLibraryFile_FileContentFragment
}

export const FileContent = ({ file }: FileContentProps) => {
  const { t } = useTranslation()

  return (
    <div className="card bg-base-100 p-4">
      <FormattedMarkdown markdown={file.markdown || t('files.noContentAvailable')} className="text-sm font-semibold" />
    </div>
  )
}
