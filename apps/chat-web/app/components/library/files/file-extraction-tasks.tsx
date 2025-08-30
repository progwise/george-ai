import { graphql } from '../../../gql'
import { FileExtractionTask_ListFragment } from '../../../gql/graphql'

graphql(`
  fragment FileExtractionTask_List on AiFileContentExtractionTask {
    id
    createdAt
    extractionMethod
    processingStartedAt
    processingFinishedAt
    processingFailedAt
    extractionStartedAt
    extractionFinishedAt
    extractionFailedAt
    embeddingStartedAt
    embeddingFinishedAt
    embeddingFailedAt
    markdownFileName
    chunksCount
    chunksSize
    embeddingModelName
    extractionOptions
    processingStatus
    extractionStatus
    embeddingStatus
    metadata
  }
`)

interface FileExtractionTasksProps {
  tasks: FileExtractionTask_ListFragment[]
}

export const FileExtractionTasks = ({ tasks }: FileExtractionTasksProps) => {
  return (
    <div>
      <h2>File Converstations</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="mb-4">
            <div>
              <pre>{JSON.stringify(task, null, 2)}</pre>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
