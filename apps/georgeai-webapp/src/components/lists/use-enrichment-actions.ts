import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'
import { getEnrichmentsQueryOptions, getListQueryOptions } from './queries'
import { clearEnrichmentsFn, startEnrichmentsFn, stopEnrichmentsFn } from './server-functions'
import { FieldFilter } from './use-list-settings'

export const useEnrichmentActions = (listId: string) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: startEnrichment, isPending: startEnrichmentIsPending } = useMutation({
    mutationFn: async (args: {
      fieldId: string
      itemId?: string
      onlyMissingValues?: boolean
      filters?: FieldFilter[]
    }) => {
      return await startEnrichmentsFn({
        data: {
          listId,
          fieldId: args.fieldId,
          itemId: args.itemId,
          onlyMissingValues: args.onlyMissingValues,
          filters: args.filters,
        },
      })
    },
    onSuccess: async (data) => {
      if (data.createdTasksCount !== undefined) {
        toastSuccess(
          t('lists.enrichment.started', {
            count: data.createdTasksCount || 0,
          }),
        )
      } else {
        toastError(t('lists.enrichment.startError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.startError'))
      console.error('Failed to start enrichment:', error)
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries(getListQueryOptions(listId)),
        queryClient.invalidateQueries({ queryKey: ['AiListFiles'] }),
        queryClient.invalidateQueries(getEnrichmentsQueryOptions({ listId, take: 20, skip: 0 })),
      ])
    },
  })

  const { mutate: stopEnrichments, isPending: stopEnrichmentsIsPending } = useMutation({
    mutationFn: async (args: { fieldId: string }) => stopEnrichmentsFn({ data: { listId, fieldId: args.fieldId } }),
    onSuccess: async (data) => {
      if (data.cleanedUpTasksCount !== undefined) {
        toastSuccess(t('lists.enrichment.stopped'))
      } else {
        toastError(t('lists.enrichment.stopError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.stopError'))
      console.error('Failed to stop enrichment:', error)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries(getListQueryOptions(listId)),
        queryClient.invalidateQueries({ queryKey: ['AiListFiles'] }),
        queryClient.invalidateQueries(getEnrichmentsQueryOptions({ listId, take: 20, skip: 0 })),
      ]),
  })

  const { mutate: clearEnrichments, isPending: clearEnrichmentsIsPending } = useMutation({
    mutationFn: async (args: { fieldId: string; itemId?: string }) =>
      clearEnrichmentsFn({ data: { listId, fieldId: args.fieldId, itemId: args.itemId } }),
    onSuccess: async (data) => {
      if (data.cleanedUpEnrichmentsCount !== undefined) {
        toastSuccess(
          t('lists.enrichment.cleaned', {
            count: data.cleanedUpEnrichmentsCount || 0,
          }),
        )
      } else {
        toastError(t('lists.enrichment.cleanError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.cleanError'))
      console.error('Failed to clean enrichments:', error)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries(getListQueryOptions(listId)),
        queryClient.invalidateQueries({ queryKey: ['AiListFiles'] }),
        queryClient.invalidateQueries(getEnrichmentsQueryOptions({ listId, take: 20, skip: 0 })),
      ]),
  })

  return {
    startEnrichment,
    stopEnrichments,
    clearEnrichments,
    isPending: startEnrichmentIsPending || stopEnrichmentsIsPending || clearEnrichmentsIsPending,
  }
}
