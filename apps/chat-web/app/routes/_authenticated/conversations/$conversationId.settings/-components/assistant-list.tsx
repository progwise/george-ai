import { Link } from '@tanstack/react-router'

import { AssistantAvatar } from '../../../../../components/conversation/avatar/assistant-avatar'
import { LanguageModelBadge } from '../../../../../components/conversation/language-model-badge'
import { AssistantBaseFragment } from '../../../../../gql/graphql'
import { CrossIcon } from '../../../../../icons/cross-icon'
import { AssistantSelector } from './assistant-selector'

interface AssistantListProps {
  assistants: AssistantBaseFragment[]
  availableAssistants: AssistantBaseFragment[]
  disabled: boolean
  onAssign: (assistantId: string) => void
  onUnassign: (assistantId: string) => void
}

export const AssistantList = ({
  assistants,
  availableAssistants,
  disabled,
  onAssign,
  onUnassign,
}: AssistantListProps) => {
  return (
    <>
      <ul className="list grow">
        {assistants.map((assistant) => {
          return (
            <li key={assistant.id} className="list-row">
              <Link to="/assistants/$assistantId" params={{ assistantId: assistant.id }} className="contents">
                <AssistantAvatar assistant={assistant} hideLink />
                <div>
                  <div>{assistant.name}</div>
                  <LanguageModelBadge size="xs">{assistant.languageModel}</LanguageModelBadge>
                </div>
              </Link>

              {!disabled && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => onUnassign(assistant.id)}
                >
                  <CrossIcon />
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <div className="p-2">
        <AssistantSelector
          assistants={availableAssistants}
          onSelect={(assistant) => onAssign(assistant.id)}
          disabled={disabled}
        />
      </div>
    </>
  )
}
