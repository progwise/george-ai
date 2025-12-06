import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { getConnectorTypesQueryOptions, getConnectorsQueryOptions } from '../../../components/admin/connectors/queries'
import { useConnectorActions } from '../../../components/admin/connectors/use-connector-actions'
import { DialogForm } from '../../../components/dialog-form'
import { ConnectorDetailFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/admin/connectors')({
  component: ConnectorsAdminPage,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getConnectorsQueryOptions()),
      context.queryClient.ensureQueryData(getConnectorTypesQueryOptions()),
    ])
  },
})

function ConnectorsAdminPage() {
  const { t } = useTranslation()

  const [editingConnector, setEditingConnector] = useState<ConnectorDetailFragment | null>(null)
  const [deletingConnectorId, setDeletingConnectorId] = useState<string | null>(null)

  const connectorDialogRef = useRef<HTMLDialogElement>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)

  const { data: connectorsData } = useSuspenseQuery(getConnectorsQueryOptions())
  const { data: typesData } = useSuspenseQuery(getConnectorTypesQueryOptions())

  const {
    enableConnectorType,
    disableConnectorType,
    createConnector,
    updateConnector,
    deleteConnector,
    testConnectorConnection,
    isPending,
  } = useConnectorActions()

  const connectors = connectorsData.connectors
  const connectorTypes = typesData.connectorTypes
  const enabledTypes = new Set(typesData.workspaceConnectorTypes.map((wct) => wct.connectorType))

  const handleAddConnector = () => {
    const firstEnabledType = connectorTypes.find((ct) => enabledTypes.has(ct.id))
    setEditingConnector({
      id: '',
      connectorType: firstEnabledType?.id || '',
      name: '',
      baseUrl: '',
      isConnected: false,
      lastTestedAt: null,
      lastError: null,
      createdAt: '',
    })
    connectorDialogRef.current?.showModal()
  }

  const handleEditConnector = (connector: ConnectorDetailFragment) => {
    setEditingConnector(connector)
    connectorDialogRef.current?.showModal()
  }

  const handleDeleteConnector = (id: string) => {
    setDeletingConnectorId(id)
    deleteDialogRef.current?.showModal()
  }

  const handleSubmitConnector = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      connectorType: formData.get('connectorType') as string,
      baseUrl: formData.get('baseUrl') as string,
      name: (formData.get('name') as string) || undefined,
      config: {
        clientId: (formData.get('clientId') as string) || undefined,
        clientSecret: (formData.get('clientSecret') as string) || undefined,
      },
    }

    const isEditing = editingConnector?.id && editingConnector.id !== ''

    if (isEditing) {
      updateConnector(
        { id: editingConnector.id, data },
        {
          onSuccess: () => {
            connectorDialogRef.current?.close()
            setEditingConnector(null)
          },
        },
      )
    } else {
      createConnector(data, {
        onSuccess: () => {
          connectorDialogRef.current?.close()
          setEditingConnector(null)
        },
      })
    }
  }

  const handleConfirmDelete = () => {
    if (deletingConnectorId) {
      deleteConnector(deletingConnectorId, {
        onSuccess: () => {
          deleteDialogRef.current?.close()
          setDeletingConnectorId(null)
        },
      })
    }
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return t('connectors.neverTested')
    return new Date(date).toLocaleString()
  }

  const isEditing = editingConnector?.id && editingConnector.id !== ''

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('connectors.title')}</h1>
          <p className="text-sm opacity-70">{t('connectors.description')}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddConnector}
          disabled={enabledTypes.size === 0}
          type="button"
        >
          {t('connectors.addConnector')}
        </button>
      </div>

      {/* Connector Types Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">{t('connectors.availableTypes')}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connectorTypes.map((type) => {
            const isEnabled = enabledTypes.has(type.id)
            return (
              <div key={type.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title">
                    <span className="text-2xl">{type.icon}</span>
                    {type.name}
                    <div className={`badge ${isEnabled ? 'badge-success' : 'badge-ghost'}`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </h3>
                  <p className="text-sm opacity-70">{type.description}</p>
                  <div className="card-actions mt-2 justify-end">
                    {isEnabled ? (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => disableConnectorType(type.id)}
                        disabled={isPending}
                        type="button"
                      >
                        {t('connectors.disableType')}
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => enableConnectorType(type.id)}
                        disabled={isPending}
                        type="button"
                      >
                        {t('connectors.enableType')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Connectors Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">{t('connectors.enabledTypes')}</h2>
        {connectors.length === 0 ? (
          <div className="alert alert-info">
            <span>{t('connectors.noConnectors')}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {connectors.map((connector) => (
              <div key={connector.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="card-title">
                        {connector.name || connector.baseUrl}
                        <div className={`badge ${connector.isConnected ? 'badge-success' : 'badge-warning'}`}>
                          {connector.isConnected ? t('connectors.connected') : t('connectors.notConnected')}
                        </div>
                        <div className="badge badge-outline">{connector.connectorType}</div>
                      </h3>
                      <p className="text-sm opacity-70">{connector.baseUrl}</p>
                      <p className="text-xs opacity-50">
                        {t('connectors.lastTested')}: {formatDate(connector.lastTestedAt)}
                        {connector.lastError && <span className="text-error ml-2">Error: {connector.lastError}</span>}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => testConnectorConnection(connector.id)}
                        disabled={isPending}
                        type="button"
                      >
                        {isPending ? <span className="loading loading-spinner loading-xs" /> : null}
                        {t('connectors.testConnection')}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleEditConnector(connector)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-error btn-ghost btn-sm"
                        onClick={() => handleDeleteConnector(connector.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <dialog className="modal" ref={connectorDialogRef}>
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="mb-6 text-2xl font-bold">
            {isEditing ? t('connectors.editConnector') : t('connectors.addConnector')}
          </h3>
          <form key={editingConnector?.id || 'new'} onSubmit={handleSubmitConnector} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">{t('connectors.connectorType')}</span>
              </label>
              <select
                name="connectorType"
                className="select select-bordered w-full"
                defaultValue={editingConnector?.connectorType}
                disabled={!!isEditing}
                required
              >
                <option value="" disabled>
                  {t('connectors.selectType')}
                </option>
                {connectorTypes
                  .filter((ct) => enabledTypes.has(ct.id))
                  .map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">{t('connectors.name')}</span>
              </label>
              <input
                type="text"
                name="name"
                className="input input-bordered w-full"
                defaultValue={editingConnector?.name || ''}
                placeholder={t('connectors.namePlaceholder')}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">{t('connectors.baseUrl')}</span>
              </label>
              <input
                type="url"
                name="baseUrl"
                className="input input-bordered w-full"
                defaultValue={editingConnector?.baseUrl}
                placeholder={t('connectors.baseUrlPlaceholder')}
                required
              />
            </div>

            <div className="divider">{t('connectors.credentials')}</div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">{t('connectors.clientId')}</span>
                </label>
                <input
                  type="text"
                  name="clientId"
                  className="input input-bordered w-full"
                  placeholder={t('connectors.clientIdPlaceholder')}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">{t('connectors.clientSecret')}</span>
                </label>
                <input
                  type="password"
                  name="clientSecret"
                  className="input input-bordered w-full"
                  placeholder={isEditing ? 'Leave empty to keep existing' : t('connectors.clientSecretPlaceholder')}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  connectorDialogRef.current?.close()
                  setEditingConnector(null)
                }}
                disabled={isPending}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="loading loading-spinner" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditing ? 'Update Connector' : 'Create Connector'}</>
                )}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => connectorDialogRef.current?.close()}>
            close
          </button>
        </form>
      </dialog>

      {/* Delete Confirmation Dialog */}
      <DialogForm
        ref={deleteDialogRef}
        title={t('connectors.deleteConnector')}
        description={t('connectors.deleteConfirmation')}
        onSubmit={handleConfirmDelete}
        submitButtonText="Delete"
        disabledSubmit={isPending}
      />
    </div>
  )
}
