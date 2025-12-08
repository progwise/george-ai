import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { z } from 'zod'

import { translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
import { Select, SelectItem } from '../form/select'
import { getListsQueryOptions } from '../lists/queries'
import { getConnectorsQueryOptions } from './queries'
import { useAutomationActions } from './use-automation-actions'

interface NewAutomationDialogProps {
  ref: React.RefObject<HTMLDialogElement | null>
}

export const NewAutomationDialog = ({ ref }: NewAutomationDialogProps) => {
  const { t, language } = useTranslation()

  const {
    data: { aiLists },
  } = useSuspenseQuery(getListsQueryOptions())

  const {
    data: { connectors },
  } = useSuspenseQuery(getConnectorsQueryOptions())

  const listOptions: SelectItem[] = aiLists.map((list) => ({ id: list.id, name: list.name }))
  const connectorOptions: SelectItem[] = connectors
    .filter((connector) => connector.name)
    .map((connector) => ({ id: connector.id, name: connector.name! }))

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, translate('automations.validation.nameRequired', language)),
        listId: z.string().min(1, translate('automations.validation.listRequired', language)),
        connectorId: z.string().min(1, translate('automations.validation.connectorRequired', language)),
      }),
    [language],
  )

  const { createAutomation, isPending } = useAutomationActions()

  const handleSubmit = (formData: FormData) => {
    createAutomation(
      {
        name: formData.get('name') as string,
        listId: formData.get('listId') as string,
        connectorId: formData.get('connectorId') as string,
      },
      { onSuccess: () => ref.current?.close() },
    )
  }

  if (connectors.length === 0) {
    return (
      <DialogForm
        ref={ref}
        title={t('automations.createDialogTitle')}
        className="max-w-sm"
        onSubmit={() => ref.current?.close()}
        submitButtonText={t('actions.close')}
      >
        <p className="text-warning">{t('automations.noConnectorsAvailable')}</p>
      </DialogForm>
    )
  }

  return (
    <DialogForm
      ref={ref}
      title={t('automations.createDialogTitle')}
      description={t('automations.createDialogDescription')}
      onSubmit={handleSubmit}
      disabledSubmit={isPending}
      submitButtonText={t('actions.create')}
      className="max-w-md"
    >
      <Input
        name="name"
        schema={schema}
        label={t('automations.labelName')}
        placeholder={t('automations.placeholderName')}
        required={true}
      />
      <Select
        name="listId"
        options={listOptions}
        value={null}
        label={t('automations.labelList')}
        placeholder={t('automations.placeholderList')}
        required={true}
        schema={schema}
      />
      <Select
        name="connectorId"
        options={connectorOptions}
        value={null}
        label={t('automations.labelConnector')}
        placeholder={t('automations.placeholderConnector')}
        required={true}
        schema={schema}
      />
    </DialogForm>
  )
}
