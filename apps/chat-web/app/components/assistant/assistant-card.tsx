import { Link } from '@tanstack/react-router'
import React from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { AssistantDeleteDialog } from './assistant-delete-dialog'

const AssistantCard_AssistantFragment = graphql(`
  fragment AssistantCard_Assistant on AiAssistant {
    id
    name
    description
    iconUrl
    ...AssistantDelete_Assistant
  }
`)

export interface AssistantCardProps {
  assistant: FragmentType<typeof AssistantCard_AssistantFragment>
}

export const AssistantCard = (props: AssistantCardProps): React.ReactElement => {
  const { t } = useTranslation()
  const assistant = useFragment(AssistantCard_AssistantFragment, props.assistant)

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
            <AssistantDeleteDialog assistant={assistant} />
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
