import { Link } from '@tanstack/react-router'
import React from 'react'

import { AssistantBaseFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { AssistantDeleteOrLeaveDialogButton } from './assistant-delete-or-leave-dialog-button/assistant-delete-or-leave-dialog-button'

export interface AssistantCardProps {
  assistant: AssistantBaseFragment
  userId: string
}

export const AssistantCard = ({ assistant, userId }: AssistantCardProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div className="card bg-base-100 w-96 shadow-xl">
      <figure className="max-h-24">
        <div className="h-36 w-full overflow-hidden rounded-lg text-center">
          {!assistant.iconUrl ? (
            <div className="text-base-content/50 bg-base-300 flex h-full w-full items-center justify-center">
              {t('assistants.hasNoIcon').replace('{assistant.name}', assistant.name)}
            </div>
          ) : (
            <img
              src={assistant.iconUrl}
              alt={t('labels.assistantIcon')}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.hidden = true
              }}
            />
          )}
        </div>
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title">{assistant.name}</h2>
        <p className="line-clamp-3">{assistant.description}</p>
        <div className="card-actions flex-wrap justify-end">
          <div className="flex gap-2">
            <div className="badge badge-outline">OpenAI</div>
            <div className="badge badge-outline">Local Only</div>
            <div className="badge badge-outline">Sequential</div>
          </div>
          <div className="flex w-full place-content-between">
            <AssistantDeleteOrLeaveDialogButton assistant={assistant} userId={userId} />
            <Link
              type="button"
              className="btn btn-ghost btn-sm"
              to={`/assistants/$assistantId`}
              params={{ assistantId: assistant.id }}
            >
              {t('actions.edit')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
