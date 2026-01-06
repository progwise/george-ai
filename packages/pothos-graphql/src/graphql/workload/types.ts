import { builder } from '../builder'

export const WorkspaceEventMessageStatisticValues = builder.simpleObject('WorkspaceEventMessageStatisticValues', {
  fields: (t) => ({
    totalMessages: t.int({ nullable: false }),
    processedMessages: t.int({ nullable: false }),
    pendingMessages: t.int({ nullable: false }),
  }),
})

export const WorkspaceEventMessageStatistic = builder.simpleObject('WorkspaceEventMessageStatistics', {
  fields: (t) => ({
    extractionRequests: t.field({
      type: WorkspaceEventMessageStatisticValues,
      nullable: false,
    }),
    embeddingRequests: t.field({
      type: WorkspaceEventMessageStatisticValues,
      nullable: false,
    }),
    embeddingProgress: t.field({
      type: WorkspaceEventMessageStatisticValues,
      nullable: false,
    }),
    embeddingFinished: t.field({
      type: WorkspaceEventMessageStatisticValues,
      nullable: false,
    }),
  }),
})

export const WorkspaceStatistics = builder.simpleObject('WorkspaceStatistics', {
  fields: (t) => ({
    workspaceId: t.string({ nullable: false }),
    eventMessageStatistics: t.field({
      type: WorkspaceEventMessageStatistic,
      nullable: false,
    }),
  }),
})
