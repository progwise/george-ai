import { graphql } from '../../../gql'
import { AiContentProcessingTask_ListFragment } from '../../../gql/graphql'

graphql(`
  fragment AiContentProcessingTask_List on AiContentProcessingTask {
    id
    createdAt
    processingStartedAt
    processingFinishedAt
    processingFailedAt
    extractionStartedAt
    extractionFinishedAt
    extractionFailedAt
    embeddingStartedAt
    embeddingFinishedAt
    embeddingFailedAt
    chunksCount
    chunksSize
    embeddingModel {
      id
      provider
      name
    }
    extractionOptions
    processingStatus
    extractionStatus
    embeddingStatus
    metadata
  }
`)

interface FileExtractionTasksProps {
  tasks: AiContentProcessingTask_ListFragment[]
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
