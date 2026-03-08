import { graphql } from '../../../gql'
import { FileCaptionCard_FileFragment } from '../../../gql/graphql'
import { FileMenu } from './file-menu'
import { FileStatusLabels } from './file-status-labels'

graphql(`
  fragment FileCaptionCard_File on AiLibraryFile {
    ...FileStatusLabels_File
    ...FileMenu_File
    ...FileNavigation_File
    id
    libraryId
    name
    originUri
  }
`)

interface FileCaptionCardProps {
  file: FileCaptionCard_FileFragment
}

export const FileCaptionCard = ({ file }: FileCaptionCardProps) => {
  return (
    <div className="flex flex-col items-center gap-4 bg-base-100">
      <div className="flex flex-col gap-1 overflow-y-auto">
        <h3 className="text-xl font-bold text-nowrap text-base-content">{file.name}</h3>
        <div className="flex justify-between">
          <FileStatusLabels file={file} />
          <a
            className="link align-text-bottom text-xs text-nowrap link-primary italic"
            href={file.originUri || '#'}
            target="_blank"
          >
            {file.originUri}
          </a>
        </div>
      </div>

      <div className="z-30 flex items-center justify-between gap-2 not-md:flex-col-reverse md:w-full">
        <FileMenu file={file} />
      </div>
    </div>
  )
}
