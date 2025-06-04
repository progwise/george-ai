import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

const avatarColors = [
  'bg-orange-600/30 text-orange-600',
  'bg-yellow-200 text-yellow-600',
  'bg-yellow-600/30 text-yellow-600',
  'bg-lime-600/30 text-lime-600',
  'bg-teal-600/30 text-teal-600',
  'bg-cyan-600/30 text-cyan-600',
  'bg-blue-600/30 text-blue-600',
  'bg-purple-600/30 text-purple-600',
  'bg-rose-600/30 text-rose-600',
  'bg-slate-600/30 text-slate-600',
]
const avatarFallbackColor = 'bg-neutral text-neutral-content'

interface AvatarProps {
  id?: string
  imageUrl?: string
  name: string
  maxPlaceholderLength?: number
}

export const Avatar = ({ id, imageUrl, name, maxPlaceholderLength = 1 }: AvatarProps) => {
  const colorClasses = useMemo(() => {
    if (!id) {
      return avatarFallbackColor
    }

    const colorIndex = Number.parseInt(id, 36) % avatarColors.length
    return avatarColors[colorIndex]
  }, [id])

  const isPlaceholderShorterThanName = maxPlaceholderLength < name.length
  const title = imageUrl || isPlaceholderShorterThanName ? name : undefined

  return (
    <div className={twMerge('avatar bg-base-100 rounded-full', !imageUrl && 'avatar-placeholder')} title={title}>
      <div className={twMerge('size-8 rounded-full', colorClasses)}>
        {imageUrl ? <img src={imageUrl} /> : <span>{name.toUpperCase().substring(0, maxPlaceholderLength)}</span>}
      </div>
    </div>
  )
}
