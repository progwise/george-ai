import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { UserFragment } from '../gql/graphql'
import { useTranslation } from '../i18n/use-translation-hook'
import { CameraIcon } from '../icons/camera-icon'
import { queryKeys } from '../query-keys'
import { isProviderAvatar } from './avatar-provider'
import { getBackendPublicUrl } from './common'
import { toastError, toastSuccess } from './georgeToaster'
import { UserAvatar } from './user-avatar'

interface AvatarUploadProps {
  user: { id: string; name?: string | null; avatarUrl?: string | null }
  className?: string
}

export const AvatarUpload = ({ user, className = 'size-12' }: AvatarUploadProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExtension = file.name.split('.').pop() || 'png'
      const uploadUrl = (await getBackendPublicUrl()) + `/avatar?userId=${user.id}`

      await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/*',
          'x-file-extension': fileExtension.toLowerCase(),
        },
        body: file,
      })
      // We don't need to return the URL since the server handles this
      return null
    },
    onSuccess: async () => {
      console.log('Avatar upload success!')
      toastSuccess(t('notifications.avatarUploaded'))

      // Use Promise.all to ensure all invalidations complete
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [queryKeys.User] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.UserProfile] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.Users] }),
      ])
      router.invalidate()
    },
    onError: (error) => {
      toastError(t('errors.avatarUploadFailed') + ': ' + error.message)
    },
    onSettled: () => {
      setIsUploading(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const deleteUrl = (await getBackendPublicUrl()) + `/avatar?userId=${user.id}`

      await fetch(deleteUrl, {
        method: 'DELETE',
      })
    },
    onSuccess: async () => {
      toastSuccess(t('notifications.avatarRemoved'))

      // Update the user query data immediately
      queryClient.setQueryData([queryKeys.User], (oldUser: UserFragment | null) => {
        if (oldUser) {
          return { ...oldUser, avatarUrl: null }
        }
        return oldUser
      })

      // Invalidate queries and refresh router context
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [queryKeys.User] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.Users] }),
      ])
      router.invalidate()
    },
    onError: (error) => {
      toastError(t('errors.avatarDeleteFailed') + ': ' + error.message)
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toastError(t('errors.invalidImageFile'))
      return
    }

    // Validate file size (5MB limit)
    const allowedMaxSize = 5 * 1024 * 1024
    if (file.size > allowedMaxSize) {
      toastError(t('errors.fileTooLarge'))
      return
    }

    setIsUploading(true)
    uploadMutation.mutate(file)
  }

  const handleRemoveAvatar = () => {
    deleteMutation.mutate()
  }

  // Check if current avatar is from an OAuth provider
  const isCurrentAvatarFromProvider = isProviderAvatar(user.avatarUrl || null)
  const canRemoveAvatar = user.avatarUrl && !isCurrentAvatarFromProvider

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <UserAvatar user={user} className={className} />
        {(isUploading || deleteMutation.isPending) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
            <div className="loading loading-spinner loading-sm text-white"></div>
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-circle btn-xs btn-primary absolute -bottom-1 -right-1"
          disabled={isUploading || deleteMutation.isPending}
        >
          <CameraIcon className="size-3" />
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-outline btn-xs"
          disabled={isUploading || deleteMutation.isPending}
        >
          {user.avatarUrl ? t('actions.changeAvatar') : t('actions.uploadAvatar')}
        </button>

        {canRemoveAvatar && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="btn btn-outline btn-error btn-xs"
            disabled={isUploading || deleteMutation.isPending}
          >
            {t('actions.removeAvatar')}
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
