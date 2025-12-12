import { ChangeEventHandler, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CameraIcon } from '../../icons/camera-icon'

type FileType = 'image/*' | 'audio/*' | 'video/*' | 'application/*'

interface IconUploadProps {
  fileTypes?: FileType[] | FileType
  className?: string
  disabled?: boolean
  handleUploadIcon: ChangeEventHandler<HTMLInputElement>
  imageUrl?: string | null | undefined
}

export const IconUpload = ({ fileTypes, className, handleUploadIcon, disabled, imageUrl }: IconUploadProps) => {
  const { t } = useTranslation()
  const ref = useRef<HTMLInputElement>(null)
  const handleClick = () => {
    ref.current?.click()
  }
  return (
    <div className={twMerge('flex items-center justify-between gap-4', className)}>
      <button
        type="button"
        className="size-36 cursor-pointer overflow-hidden rounded-full border border-base-content bg-cover bg-center bg-no-repeat text-center"
        onClick={handleClick}
        disabled={disabled}
      >
        {!imageUrl ? (
          <CameraIcon className="size-full p-5 text-base-content/50 hover:text-base-content/80" />
        ) : (
          <img
            src={imageUrl}
            alt={t('labels.icon')}
            className="size-full object-cover"
            onError={(event) => {
              event.currentTarget.hidden = true
            }}
          />
        )}
      </button>
      <input
        type="file"
        accept={fileTypes ? (Array.isArray(fileTypes) ? fileTypes.join(',') : fileTypes) : undefined}
        multiple={false}
        ref={ref}
        onChange={handleUploadIcon}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </div>
  )
}
