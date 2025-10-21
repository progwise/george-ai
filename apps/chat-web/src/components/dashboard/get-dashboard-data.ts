import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const dashboardDataDocument = graphql(`
  query GetDashboardData {
    aiConversations(orderBy: updatedAtDesc) {
      id
      createdAt
      updatedAt
      owner {
        id
        name
      }
    }
    aiAssistants {
      id
      name
    }
    aiLists {
      id
      name
      owner {
        id
      }
    }
    aiLibraries(orderBy: updatedAtDesc) {
      id
      name
      filesCount
      owner {
        id
      }
      updatedAt
    }
    aiServiceStatus {
      instances {
        name
        isOnline
        type
        availableModels {
          name
        }
      }
    }
    queueSystemStatus {
      queues {
        queueType
        isRunning
        pendingTasks
        processingTasks
        failedTasks
      }
    }
  }
`)

const getDashboardData = createServerFn({ method: 'GET' }).handler(() => backendRequest(dashboardDataDocument))

export const getDashboardDataQueryOptions = () =>
  queryOptions({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(),
  })
