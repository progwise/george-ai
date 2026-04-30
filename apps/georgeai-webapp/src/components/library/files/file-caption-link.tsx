import { useSuspenseQuery } from '@tanstack/react-query'

import { graphql } from '../../../gql'
import { DocumentIcon } from '../../../icons/document-icon'
import { ExternalLinkIcon } from '../../../icons/external-link-icon'
import { getDocumentQueryOptions } from '../queries'

graphql(`
  fragment FileCaptionCard_File on AiLibraryFile {
    ...FileMenu_File
    id
    libraryId
    name
    originUri
  }
`)

interface FileCaptionCardProps {
  fileId: string
  libraryId: string
}

export const FileCaptionLink = ({ fileId, libraryId }: FileCaptionCardProps) => {
  const { data: file } = useSuspenseQuery(getDocumentQueryOptions({ fileId, libraryId }))

  return (
    <div className="tooltip flex items-center tooltip-info" data-tip={file.originUri}>
      <DocumentIcon className="mr-2" />
      <h3 className="text-xl font-bold text-nowrap">{file.name}</h3>
      {file.originUri && (
        <a className="link text-xs text-nowrap link-primary italic" href={file.originUri} target="_blank">
          <ExternalLinkIcon className="ml-2" />
        </a>
      )}
    </div>
  )
}
