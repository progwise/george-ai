import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'
import { getAutomationItemsQueryOptions, getAutomationQueryOptions, getAutomationsQueryOptions } from './queries'
import {
  CreateAutomationInput,
  UpdateAutomationInput,
  createAutomationFn,
  deleteAutomationFn,
  triggerAutomationFn,
  triggerAutomationItemFn,
  updateAutomationFn,
} from './server-functions'

interface CreateAutomationParams {
  name: string
  listId: string
  connectorId: string
}

interface UpdateAutomationParams {
  id: string
  name: string
  listId: string
  connectorId: string
  connectorAction: string
  actionConfig: string
  executeOnEnrichment?: boolean
}

export const useAutomationActions = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate: createAutomation, isPending: isCreatePending } = useMutation({
    mutationFn: (params: CreateAutomationParams) => {
      const data: CreateAutomationInput = {
        name: params.name,
        listId: params.listId,
        connectorId: params.connectorId,
        connectorAction: 'writeProductDescription', // Default action for MVP
        actionConfig: JSON.stringify({}), // Empty config, will be configured on edit page
      }
      return createAutomationFn({ data })
    },
    onError: (error) => toastError(t('automations.createError', { message: error.message })),
    onSuccess: async ({ createAutomation: automation }) => {
      toastSuccess(t('automations.createSuccess'))
      await queryClient.invalidateQueries(getAutomationsQueryOptions())
      navigate({ to: '/automations/$automationId/edit', params: { automationId: automation.id } })
    },
  })

  const { mutate: deleteAutomation, isPending: isDeletePending } = useMutation({
    mutationFn: (automationId: string) => deleteAutomationFn({ data: automationId }),
    onSuccess: async () => {
      toastSuccess(t('automations.deleteSuccess'))
    },
    onError: (error) => toastError(t('automations.deleteError', { message: error.message })),
    onSettled: async (_data, _error, automationId) => {
      await Promise.all([
        queryClient.invalidateQueries(getAutomationsQueryOptions()),
        queryClient.removeQueries(getAutomationQueryOptions(automationId)),
      ])
      await navigate({ to: '/automations' })
    },
  })

  const { mutate: triggerAutomation, isPending: isTriggerPending } = useMutation({
    mutationFn: (automationId: string) => triggerAutomationFn({ data: automationId }),
    onSuccess: async ({ triggerAutomation: result }) => {
      if (result.success) {
        toastSuccess(result.message)
      } else {
        toastError(result.message)
      }
    },
    onError: (error) => toastError(t('automations.triggerError', { message: error.message })),
    onSettled: async (_data, _error, automationId) => {
      await queryClient.invalidateQueries(getAutomationQueryOptions(automationId))
    },
  })

  const { mutate: updateAutomation, isPending: isUpdatePending } = useMutation({
    mutationFn: (params: UpdateAutomationParams) => {
      const data: UpdateAutomationInput = {
        id: params.id,
        name: params.name,
        listId: params.listId,
        connectorId: params.connectorId,
        connectorAction: params.connectorAction,
        actionConfig: params.actionConfig,
        executeOnEnrichment: params.executeOnEnrichment,
      }
      return updateAutomationFn({ data })
    },
    onError: (error) => toastError(error.message),
    onSuccess: async ({ updateAutomation: automation }) => {
      toastSuccess(t('automations.updateSuccess'))
      await Promise.all([
        queryClient.invalidateQueries(getAutomationsQueryOptions()),
        queryClient.invalidateQueries(getAutomationQueryOptions(automation.id)),
      ])
    },
  })

  const { mutate: triggerAutomationItem, isPending: isTriggerItemPending } = useMutation({
    mutationFn: ({ itemId }: { automationId: string; itemId: string }) => triggerAutomationItemFn({ data: itemId }),
    onSuccess: async ({ triggerAutomationItem: result }) => {
      if (result.success) {
        toastSuccess(result.message)
      } else {
        toastError(result.message)
      }
    },
    onError: (error) => toastError(t('automations.triggerError', { message: error.message })),
    onSettled: async (_data, _error, { automationId }) => {
      await queryClient.invalidateQueries(getAutomationItemsQueryOptions({ automationId }))
    },
  })

  return {
    createAutomation,
    deleteAutomation,
    triggerAutomation,
    triggerAutomationItem,
    updateAutomation,
    isPending: isCreatePending || isDeletePending || isTriggerPending || isUpdatePending || isTriggerItemPending,
  }
}
