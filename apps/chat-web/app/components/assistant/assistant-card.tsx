import { Link } from '@tanstack/react-router'
import React from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { AssistantDeleteDialog } from './assistant-delete-dialog'

const AssistantCard_assistantFragment = graphql(`
  fragment AssistantCard_assistantFragment on AiAssistant {
    id
    name
    description
    iconUrl
    ...AssistantDelete_assistantFragment
  }
`)

export interface AssistantCardProps {
  assistant: FragmentType<typeof AssistantCard_assistantFragment>
}

export const AssistantCard = (props: AssistantCardProps): React.ReactElement => {
  const { t } = useTranslation()
  const assistant = useFragment(AssistantCard_assistantFragment, props.assistant)

  return (
    <>
      <div key={assistant.id} className="card w-96 bg-base-100 shadow-xl">
        <figure className="max-h-24">
          <div className="absolute left-2 right-2 top-2 flex justify-between gap-2">
            <AssistantDeleteDialog assistant={assistant} />
          </div>
          <div className="h-36 w-full overflow-hidden rounded-lg border bg-black/5 bg-cover bg-center bg-no-repeat text-center">
            <img
              key={Date.now()}
              src={assistant.iconUrl}
              alt={t('labels.assistantIcon')}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.hidden = true
              }}
            />
          </div>
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title">{assistant.name}</h2>
          <p>{assistant.description}</p>
          <div className="card-actions flex-wrap justify-end">
            <div className="flex gap-2">
              <div className="badge badge-outline">OpenAI</div>
              <div className="badge badge-outline">Local Only</div>
              <div className="badge badge-outline">Sequential</div>
            </div>
            <Link
              type="button"
              className="btn btn-ghost btn-secondary btn-sm"
              to={`/assistants/$assistantId`}
              params={{ assistantId: assistant.id }}
            >
              {t('actions.edit')}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
