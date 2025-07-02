import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { AssistantBaseFragment } from '../../gql/graphql'
import BotIcon from '../../icons/bot-icon'

interface AssistantIconProps {
  assistant: AssistantBaseFragment
  className?: string
  showFallback?: boolean
}

export const AssistantIcon = ({
  assistant,
  className,
  showFallback = true,
}: AssistantIconProps): React.ReactElement | null => {
  const [imageError, setImageError] = useState(false)
  const [lastIconUrl, setLastIconUrl] = useState(assistant.iconUrl)

  // Reset image error when iconUrl changes
  if (lastIconUrl !== assistant.iconUrl) {
    setImageError(false)
    setLastIconUrl(assistant.iconUrl)
  }

  const shouldShowImage = assistant.iconUrl && !imageError
  const shouldShowFallback = showFallback && (!assistant.iconUrl || imageError)

  if (shouldShowImage) {
    const iconSrc = assistant.iconUrl + '&updated=' + assistant.updatedAt

    return (
      <div className={twMerge('avatar', className)}>
        <div className="h-full w-full rounded-full">
          <img
            className="h-full w-full object-cover"
            src={iconSrc}
            alt={assistant.name}
            onError={() => setImageError(true)}
          />
        </div>
      </div>
    )
  }

  if (shouldShowFallback) {
    return (
      <div className={twMerge('avatar avatar-placeholder', className)}>
        <div className="bg-secondary text-secondary-content flex h-full w-full items-center justify-center rounded-full">
          <BotIcon className="size-6 text-current" />
        </div>
      </div>
    )
  }

  return null
}
