import { graphql } from '../../../gql'
import { FileCaptionCard_FileFragment } from '../../../gql/graphql'
import { FileMenu } from './file-menu'

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
  file: FileCaptionCard_FileFragment
}

export const FileCaptionCard = ({ file }: FileCaptionCardProps) => {
  return (
    <div className="grid grid-rows-[auto_auto] gap-4">
      <div className="overflow-hidden text-ellipsis">
        <h3 className="text-xl font-bold text-nowrap text-base-content">{file.name}</h3>
        <a className="link text-xs text-nowrap link-primary italic" href={file.originUri || '#'} target="_blank">
          {file.originUri}
        </a>
      </div>

      <FileMenu file={file} />
    </div>
  )
}
