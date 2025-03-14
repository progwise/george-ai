import { ChangeEventHandler, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { PlusIcon } from '../../icons/plus-icon'

type FileType = 'image/*' | 'audio/*' | 'video/*' | 'application/*'

interface FileUploadProps {
  fileTypes?: FileType[] | FileType
  className?: string
  multiple?: boolean
  disabled?: boolean
  handleUploadFiles: ChangeEventHandler<HTMLInputElement>
}

export const FileUpload = ({ fileTypes, className, handleUploadFiles, multiple, disabled }: FileUploadProps) => {
  const ref = useRef<HTMLInputElement>(null)
  const handleClick = () => {
    ref.current?.click()
  }
  return (
    <div className={twMerge('flex items-center justify-between gap-4', className)}>
      <button type="button" className="btn-xl btn btn-circle btn-outline" onClick={handleClick} disabled={disabled}>
        <PlusIcon className="size-4" />
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
