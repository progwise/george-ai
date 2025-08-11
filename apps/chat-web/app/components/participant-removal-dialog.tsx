import { useRef } from 'react'

import { useTranslation } from '../i18n/use-translation-hook'
import { CrossIcon } from '../icons/cross-icon'
import { DialogForm } from './dialog-form'

interface ParticipantRemovalDialogProps {
  onConfirm: () => void
  isPending?: boolean
  confirmationText: string
  title: string
}

export const ParticipantRemovalDialog = ({
  onConfirm,
  isPending = false,
  confirmationText,
  title,
}: ParticipantRemovalDialogProps) => {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleSubmit = () => {
    onConfirm()
    dialogRef.current?.close()
  }

  return (
    <>
      <button
        type="button"
        className="bg-error ring-base-100 tooltip tooltip-bottom absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 transition-transform hover:scale-110"
        data-tip={t('actions.remove')}
        onClick={() => dialogRef.current?.showModal()}
      >
        <CrossIcon className="text-error-content size-2" />
      </button>

      <DialogForm
        ref={dialogRef}
        title={title}
        description={confirmationText}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.confirm')}
      />
    </>
  )
}
