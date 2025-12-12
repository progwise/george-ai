import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { AssistantBaseFragment } from '../../gql/graphql'
import BotIcon from '../../icons/bot-icon'

interface AssistantIconProps {
  assistant: AssistantBaseFragment
  className?: string
}

export const AssistantIcon = ({ assistant, className }: AssistantIconProps): React.ReactElement => {
  const [imageError, setImageError] = useState(false)
  const [lastIconUrl, setLastIconUrl] = useState(assistant.iconUrl)

  // Reset image error when iconUrl changes
  if (lastIconUrl !== assistant.iconUrl) {
    setImageError(false)
    setLastIconUrl(assistant.iconUrl)
  }

  if (assistant.iconUrl && !imageError) {
    const iconSrc = assistant.iconUrl + '&updated=' + assistant.updatedAt

    return (
      <div className={twMerge('avatar', className)}>
        <div className="size-full rounded-full">
          <img
            className="size-full object-cover"
            src={iconSrc}
            alt={assistant.name}
            onError={() => setImageError(true)}
          />
        </div>
      </div>
    )
  } else {
    return (
      <div className={twMerge('avatar avatar-placeholder', className)}>
        <div className="flex size-full items-center justify-center rounded-full bg-secondary text-secondary-content">
          <BotIcon className="size-6 text-current" />
        </div>
      </div>
    )
  }
}
