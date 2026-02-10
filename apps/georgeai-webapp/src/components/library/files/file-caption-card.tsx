import { graphql } from '../../../gql'
import { FileCaptionCard_FileFragment } from '../../../gql/graphql'
import { FileMenu } from './file-menu'
import { FileNavigation } from './file-navigation'
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
    <div className="flex flex-col bg-base-100">
      <div className="">
        <a
          className="link align-text-top text-xs text-nowrap link-primary italic"
          href={file.originUri || '#'}
          target="_blank"
        >
          {file.originUri}
        </a>
      </div>
      <div className="flex justify-between align-top">
        <div className="flex flex-col gap-1 overflow-y-auto">
          <h3 className="text-xl font-bold text-nowrap text-base-content">{file.name}</h3>
          <FileStatusLabels file={file} />
        </div>
        <div className="z-30 md:flex">
          <FileMenu file={file} />
        </div>
      </div>
      <div className="mt-10 flex md:justify-center">
        <FileNavigation file={file} />
      </div>
    </div>
  )
}
