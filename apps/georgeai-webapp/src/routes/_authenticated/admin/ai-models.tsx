import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Fragment, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { DialogForm } from '../../../components/dialog-form'
import { toastError, toastSuccess } from '../../../components/georgeToaster'
import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { CpuIcon } from '../../../icons/cpu-icon'
import { RefreshIcon } from '../../../icons/refresh-icon'
import { TrashIcon } from '../../../icons/trash-icon'
import { backendRequest } from '../../../server-functions/backend'

// Server functions
const getAiLanguageModels = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await backendRequest(
    graphql(`
      query GetAiLanguageModels {
        aiLanguageModels {
          id
          name
          provider
          canDoEmbedding
          canDoChatCompletion
          canDoVision
          canDoFunctionCalling
          enabled
          adminNotes
          lastUsedAt
          createdAt
        }
      }
    `),
    {},
  )
  return result.aiLanguageModels
})

const syncModels = createServerFn({ method: 'POST' }).handler(async () => {
  return await backendRequest(
    graphql(`
      mutation SyncModels {
        syncModels {
          success
          modelsDiscovered
          errors
        }
      }
    `),
    {},
  )
})

const updateAiLanguageModel = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; enabled?: boolean; adminNotes?: string }) => data)
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await backendRequest(
      graphql(`
        mutation UpdateAiLanguageModel($id: ID!, $data: UpdateAiLanguageModelInput!) {
          updateAiLanguageModel(id: $id, data: $data) {
            id
            enabled
            adminNotes
          }
        }
      `),
      {
        id,
        data: updateData,
      },
    )
  })

const deleteAiLanguageModel = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation DeleteAiLanguageModel($id: ID!) {
          deleteAiLanguageModel(id: $id) {
            id
          }
        }
      `),
      { id: ctx.data.id },
    )
  })

// Query options
export const aiLanguageModelsQueryOptions = () => ({
  queryKey: ['aiLanguageModels'],
  queryFn: () => getAiLanguageModels(),
})

export const Route = createFileRoute('/_authenticated/admin/ai-models')({
  beforeLoad: ({ context }) => {
    if (!context.user?.isAdmin) {
      throw notFound()
    }
    return {}
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(aiLanguageModelsQueryOptions())
  },
  component: AiModelsPage,
})

interface EditingModel {
  id: string
  name: string
  provider: string
  enabled: boolean
  adminNotes: string | null
}

function AiModelsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: models } = useSuspenseQuery(aiLanguageModelsQueryOptions())

  const [editingModel, setEditingModel] = useState<EditingModel | null>(null)
  const [deletingModelId, setDeletingModelId] = useState<string | null>(null)

  const editDialogRef = useRef<HTMLDialogElement>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)

  // Group models by provider
  const modelsByProvider = models.reduce<Record<string, typeof models>>((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = []
    }
    acc[model.provider].push(model)
    return acc
  }, {})

  const providers = Object.keys(modelsByProvider)

  const syncMutation = useMutation({
    mutationFn: () => syncModels(),
    onSuccess: (data) => {
      if (data.syncModels?.success) {
        toastSuccess(
          t('admin.aiModels.syncSuccess', {
            count: data.syncModels.modelsDiscovered.toString(),
          }),
        )
        queryClient.invalidateQueries({ queryKey: ['aiLanguageModels'] })
      } else {
        toastError(
          <div>
            <div>{t('admin.aiModels.syncFailed')}</div>
            {data.syncModels?.errors.map((error: string) => (
              <div key={error} className="mt-1 text-xs">
                {error}
              </div>
            ))}
          </div>,
        )
      }
    },
    onError: (error: Error) => {
      toastError(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; enabled?: boolean; adminNotes?: string }) => updateAiLanguageModel({ data }),
    onSuccess: () => {
      toastSuccess(t('admin.aiModels.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['aiLanguageModels'] })
      editDialogRef.current?.close()
      setEditingModel(null)
    },
    onError: (error: Error) => {
      toastError(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAiLanguageModel({ data: { id } }),
    onSuccess: () => {
      toastSuccess(t('admin.aiModels.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['aiLanguageModels'] })
      deleteDialogRef.current?.close()
      setDeletingModelId(null)
    },
    onError: (error: Error) => {
      toastError(error.message)
      deleteDialogRef.current?.close()
      setDeletingModelId(null)
    },
  })

  const handleEdit = (model: (typeof models)[number]) => {
    setEditingModel({
      id: model.id,
      name: model.name,
      provider: model.provider,
      enabled: model.enabled,
      adminNotes: model.adminNotes || null,
    })
    editDialogRef.current?.showModal()
  }

  const handleDelete = (modelId: string) => {
    setDeletingModelId(modelId)
    deleteDialogRef.current?.showModal()
  }

  const handleUpdateSubmit = (formData: FormData) => {
    if (!editingModel) return

    const enabled = formData.get('enabled') === 'on'
    const adminNotes = formData.get('adminNotes') as string

    updateMutation.mutate({
      id: editingModel.id,
      enabled,
      adminNotes: adminNotes || undefined,
    })
  }

  const deletingModel = deletingModelId ? models.find((m) => m.id === deletingModelId) : null

  return (
    <div className="bg-linear-to-br from-base-200 via-base-100 to-base-200 grid h-full w-full grid-rows-[auto_1fr]">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-primary mb-2 text-4xl font-bold">{t('admin.manageAiModels')}</h1>
            <p className="text-lg opacity-80">{t('admin.manageAiModelsDescription')}</p>
          </div>
          <button
            type="button"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className={twMerge('btn btn-primary', syncMutation.isPending && 'loading')}
          >
            {!syncMutation.isPending && <RefreshIcon className="h-5 w-5" />}
            {t('admin.aiModels.syncModels')}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card border-base-300 bg-base-100 border shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-60">{t('admin.aiModels.totalModels')}</p>
                  <p className="text-3xl font-bold">{models.length}</p>
                </div>
                <CpuIcon className="h-12 w-12 opacity-30" />
              </div>
            </div>
          </div>

          <div className="card border-base-300 bg-base-100 border shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-60">{t('admin.aiModels.enabledModels')}</p>
                  <p className="text-success text-3xl font-bold">{models.filter((m) => m.enabled).length}</p>
                </div>
                <div className="badge badge-success badge-lg">{t('admin.aiModels.enabled')}</div>
              </div>
            </div>
          </div>

          <div className="card border-base-300 bg-base-100 border shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-60">{t('admin.aiModels.providers')}</p>
                  <p className="text-3xl font-bold">{Object.keys(modelsByProvider).length}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {Object.keys(modelsByProvider).map((provider) => (
                    <div key={provider} className="badge badge-sm">
                      {provider}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card border-base-300 bg-base-100 border shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-60">{t('admin.aiModels.embeddingModels')}</p>
                  <p className="text-info text-3xl font-bold">{models.filter((m) => m.canDoEmbedding).length}</p>
                </div>
                <div className="badge badge-info badge-lg">{t('admin.aiModels.embedding')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Tabs */}
      <div className="min-h-0 min-w-0 px-6 pb-8">
        <div className="h-full w-full overflow-auto">
          <div className="tabs tabs-boxed">
            {providers.map((provider, index) => {
              const providerModels = modelsByProvider[provider]
              return (
                <Fragment key={provider}>
                  <input
                    type="radio"
                    name="provider_tabs"
                    className="tab"
                    aria-label={`${provider} (${providerModels.length})`}
                    defaultChecked={index === 0}
                  />
                  <div className="tab-content pt-6">
                    <table className="table-pin-rows table-pin-cols table">
                      <thead>
                        <tr>
                          <th>{t('admin.aiModels.name')}</th>
                          <th>{t('admin.aiModels.capabilities')}</th>
                          <th>{t('admin.aiModels.status')}</th>
                          <th>{t('admin.aiModels.lastUsed')}</th>
                          <th>{t('admin.aiModels.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providerModels.map((model) => (
                          <tr key={model.id}>
                            <th>
                              <div className="flex flex-col">
                                <span className="font-mono font-semibold">{model.name}</span>
                                {model.adminNotes && <span className="text-xs opacity-60">{model.adminNotes}</span>}
                              </div>
                            </th>
                            <td>
                              <div className="flex flex-wrap gap-1">
                                {model.canDoChatCompletion && <div className="badge badge-sm badge-primary">Chat</div>}
                                {model.canDoEmbedding && <div className="badge badge-sm badge-info">Embedding</div>}
                                {model.canDoVision && <div className="badge badge-sm badge-secondary">Vision</div>}
                                {model.canDoFunctionCalling && (
                                  <div className="badge badge-sm badge-accent">Functions</div>
                                )}
                              </div>
                            </td>
                            <td>
                              {model.enabled ? (
                                <div className="badge badge-success">{t('admin.aiModels.enabled')}</div>
                              ) : (
                                <div className="badge badge-error">{t('admin.aiModels.disabled')}</div>
                              )}
                            </td>
                            <td>
                              <span className="text-sm opacity-60">
                                {model.lastUsedAt
                                  ? new Date(model.lastUsedAt).toLocaleString()
                                  : t('admin.aiModels.neverUsed')}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(model)}
                                  className="btn btn-ghost btn-sm"
                                >
                                  {t('admin.aiModels.edit')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(model.id)}
                                  className="btn btn-ghost btn-sm text-error"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingModel && (
        <DialogForm
          ref={editDialogRef}
          title={t('admin.aiModels.editModel')}
          description={`${editingModel.provider}: ${editingModel.name}`}
          onSubmit={handleUpdateSubmit}
          submitButtonText={t('admin.aiModels.save')}
          disabledSubmit={updateMutation.isPending}
        >
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">{t('admin.aiModels.enabled')}</span>
              <input
                type="checkbox"
                name="enabled"
                className="toggle toggle-primary"
                defaultChecked={editingModel.enabled}
              />
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">{t('admin.aiModels.adminNotes')}</span>
            </label>
            <textarea
              name="adminNotes"
              className="textarea textarea-bordered"
              rows={3}
              placeholder={t('admin.aiModels.adminNotesPlaceholder')}
              defaultValue={editingModel.adminNotes || ''}
            />
          </div>
        </DialogForm>
      )}

      {/* Delete Confirmation Modal */}
      {deletingModel && (
        <DialogForm
          ref={deleteDialogRef}
          title={t('admin.aiModels.deleteModel')}
          description={t('admin.aiModels.deleteConfirmation', {
            name: deletingModel.name,
            provider: deletingModel.provider,
          })}
          onSubmit={() => {
            deleteMutation.mutate(deletingModel.id)
          }}
          submitButtonText={t('admin.aiModels.delete')}
          disabledSubmit={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
