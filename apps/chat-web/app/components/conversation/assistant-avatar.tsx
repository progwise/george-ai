import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

import { AiAssistant } from '../../gql/graphql'

interface AssistantAvatarProps {
  assistant: Pick<AiAssistant, 'id' | 'name' | 'iconUrl'>
}

const avatarColors = [
  'bg-orange-600/30 text-orange-600',
  'bg-yellow-600/30 text-yellow-600',
  'bg-lime-600/30 text-lime-600',
  'bg-teal-600/30 text-teal-600',
  'bg-cyan-600/30 text-cyan-600',
  'bg-blue-600/30 text-blue-600',
  'bg-purple-600/30 text-purple-600',
  'bg-rose-600/30 text-rose-600',
  'bg-slate-600/30 text-slate-600',
]

export const AssistantAvatar = ({ assistant: { id, iconUrl, name } }: AssistantAvatarProps) => {
  // use the id to generate a color index
  const colorIndex = useMemo(() => Number.parseInt(id, 36) % avatarColors.length, [id])
  const colorClasses = avatarColors[colorIndex]

  return (
    <div className={twMerge('avatar', !iconUrl && 'avatar-placeholder')} title={name}>
      <div className={twMerge('size-8 rounded-full', colorClasses)}>
        {iconUrl ? <img src={iconUrl} /> : <span>{name.toUpperCase().at(0)}</span>}
      </div>
    </div>
  )
}
