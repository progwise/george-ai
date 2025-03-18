import { RefObject } from 'react'

import { useTranslation } from '../i18n/use-translation-hook'

export interface DialogFormProps {
  ref: RefObject<HTMLDialogElement | null>
  title: string
  description?: string
  onSubmit: (data: FormData) => void
  children?: React.ReactNode
  disabledSubmit?: boolean
  submitButtonText?: string
}

export const DialogForm = ({
  ref,
  title,
  description,
  onSubmit,
  children,
  disabledSubmit,
  submitButtonText,
}: DialogFormProps) => {
  const { t } = useTranslation()
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSubmit(formData)
  }

  const handleClose = () => {
    ref.current?.close()
  }

  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        {description && <p className="py-4">{description}</p>}
        <form method="dialog" onSubmit={handleSubmit}>
          <div className="flex flex-row justify-items-stretch gap-2">{children}</div>
          <div className="modal-action">
            <button type="button" className="btn btn-sm" onClick={handleClose}>
              {t('dialog.cancel')}
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={disabledSubmit}>
              {submitButtonText || t('dialog.confirm')}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button type="button" onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  )
}
