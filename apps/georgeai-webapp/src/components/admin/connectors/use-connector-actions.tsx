import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { queryKeys } from '../../../query-keys'
import { toastError, toastSuccess } from '../../georgeToaster'
import {
  CreateConnectorInput,
  UpdateConnectorInput,
  createConnectorFn,
  deleteConnectorFn,
  disableConnectorTypeFn,
  enableConnectorTypeFn,
  testConnectorConnectionFn,
  updateConnectorFn,
} from './server-functions'

export const useConnectorActions = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: enableConnectorType, isPending: isEnablePending } = useMutation({
    mutationFn: (connectorType: string) => enableConnectorTypeFn({ data: connectorType }),
    onSuccess: () => {
      toastSuccess(t('connectors.typeEnabled'))
      queryClient.invalidateQueries({ queryKey: queryKeys.ConnectorTypes })
    },
    onError: (error) => {
      toastError(error instanceof Error ? error.message : 'Failed to enable connector type')
    },
  })

  const { mutate: disableConnectorType, isPending: isDisablePending } = useMutation({
    mutationFn: (connectorType: string) => disableConnectorTypeFn({ data: connectorType }),
    onSuccess: () => {
      toastSuccess(t('connectors.typeDisabled'))
      queryClient.invalidateQueries({ queryKey: queryKeys.ConnectorTypes })
    },
    onError: (error) => {
      toastError(error instanceof Error ? error.message : t('connectors.cannotDisable'))
    },
  })

  const { mutate: createConnector, isPending: isCreatePending } = useMutation({
    mutationFn: (data: CreateConnectorInput) => createConnectorFn({ data }),
    onSuccess: () => {
      toastSuccess(t('connectors.createSuccess'))
      queryClient.invalidateQueries({ queryKey: queryKeys.Connectors })
    },
    onError: (error) => {
      toastError(error instanceof Error ? error.message : 'Failed to create connector')
    },
  })

  const { mutate: updateConnector, isPending: isUpdatePending } = useMutation({
    mutationFn: (params: UpdateConnectorInput) => updateConnectorFn({ data: params }),
    onSuccess: () => {
      toastSuccess(t('connectors.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: queryKeys.Connectors })
    },
    onError: (error) => {
      toastError(error instanceof Error ? error.message : 'Failed to update connector')
    },
  })

  const { mutate: deleteConnector, isPending: isDeletePending } = useMutation({
    mutationFn: (id: string) => deleteConnectorFn({ data: id }),
    onSuccess: () => {
      toastSuccess(t('connectors.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: queryKeys.Connectors })
    },
    onError: (error) => {
      toastError(error instanceof Error ? error.message : 'Failed to delete connector')
    },
  })

  const { mutate: testConnectorConnection, isPending: isTestPending } = useMutation({
    mutationFn: (id: string) => testConnectorConnectionFn({ data: id }),
    onSuccess: (result) => {
      if (result.testConnectorConnection.success) {
        toastSuccess(result.testConnectorConnection.message)
      } else {
        toastError(
          <div>
            <div>{result.testConnectorConnection.message}</div>
            {result.testConnectorConnection.details && (
              <div className="text-xs opacity-70">{result.testConnectorConnection.details}</div>
            )}
          </div>,
        )
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.Connectors })
    },
    onError: (error) => {
      toastError(error instanceof Error ? error.message : t('connectors.testFailed'))
    },
  })

  return {
    enableConnectorType,
    disableConnectorType,
    createConnector,
    updateConnector,
    deleteConnector,
    testConnectorConnection,
    isPending:
      isEnablePending || isDisablePending || isCreatePending || isUpdatePending || isDeletePending || isTestPending,
  }
}
