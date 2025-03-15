import { ChangeEventHandler, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../i18n/use-translation-hook'

type FileType = 'image/*' | 'audio/*' | 'video/*' | 'application/*'

interface FileUploadProps {
  fileTypes?: FileType[] | FileType
  className?: string
  multiple?: boolean
  disabled?: boolean
  handleUploadFiles: ChangeEventHandler<HTMLInputElement>
  imageUrl?: string
}

export const FileUpload = ({
  fileTypes,
  className,
  handleUploadFiles,
  multiple,
  disabled,
  imageUrl,
}: FileUploadProps) => {
  const { t } = useTranslation()
  const ref = useRef<HTMLInputElement>(null)
  const handleClick = () => {
    ref.current?.click()
  }
  return (
    <div className={twMerge('flex items-center justify-between gap-4', className)}>
      <button
        type="button"
        className="h-36 w-36 overflow-hidden rounded-full border bg-black/5 bg-cover bg-center bg-no-repeat text-center"
        onClick={handleClick}
        disabled={disabled}
      >
        <img
          key={Date.now()}
          src={imageUrl}
          alt={t('labels.assistantIcon')}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.hidden = true
          }}
        />
      </button>
      <input
        type="file"
        accept={fileTypes ? (Array.isArray(fileTypes) ? fileTypes.join(',') : fileTypes) : undefined}
        multiple={!!multiple}
        ref={ref}
        onChange={handleUploadFiles}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </div>
  )
}
