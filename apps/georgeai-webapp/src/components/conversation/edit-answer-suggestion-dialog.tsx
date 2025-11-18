import { RefObject, useState } from 'react'
import z from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { useTranslation } from '../../i18n/use-translation-hook'
import { Input } from '../form/input'
import { toastWarning } from '../georgeToaster'
import { Message } from './conversation-message'

interface EditAnswerSuggestionDialogProps {
  ref: RefObject<HTMLDialogElement | null>
  message: Message
  onSubmit: (formData: EditFeedbackSuggestionFormInput) => void
  onDeleteButtonClick: (feedbackId: string) => void
}

const getFormSchema = () =>
  z.object({
    id: z.string().nonempty(),
    answerSuggestion: z.string().optional(),
  })

export type EditFeedbackSuggestionFormInput = z.infer<ReturnType<typeof getFormSchema>>

export const EditAnswerSuggestionDialog = ({
  ref,
  message,
  onSubmit,
  onDeleteButtonClick,
}: EditAnswerSuggestionDialogProps) => {
  const { t } = useTranslation()
  const formSchema = getFormSchema()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { errors, data } = validateForm(event.currentTarget, formSchema)
    if (errors) {
      toastWarning(
        <ul>
          {errors?.map((error) => (
            <li key={error}>{error.split(':').pop()}</li>
          ))}
        </ul>,
      )
      return
    }
    onSubmit(data)
    ref.current?.close()
  }

  const handleClose = () => {
    setIsConfirmingDelete(false)
    ref.current?.close()
  }

  const handleDeleteButtonClick = () => {
    if (isConfirmingDelete) {
      if (message.feedback) onDeleteButtonClick(message.feedback.id)
      setIsConfirmingDelete(false)
      ref.current?.close()
    } else {
      setIsConfirmingDelete(true)
    }
  }

  return (
    <dialog className="modal" ref={ref}>
      <div className={'modal-box flex flex-col'}>
        <h3 className="text-lg font-bold">{t('conversations.editSuggestedAnswerTitel')}</h3>
        <p className="m-2 py-4">{t('texts.editSuggestedAnswerDescription')}</p>
        <form method="dialog" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          {message.feedback && <input type="hidden" name="id" value={message.feedback.id} />}
          <Input
            label={t('labels.alternativeAnswerSuggestion')}
            name="feedbackSuggestion"
            value={message.feedback?.feedbackSuggestion ? message.feedback.feedbackSuggestion : ''}
          />
          {/* button area: */}
          <div className="modal-action flex justify-end gap-2">
            <button type="button" className="btn btn-sm" onClick={handleClose}>
              {t('actions.cancel')}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isConfirmingDelete && 'text-error bg-error/10 hover:bg-error/20'}`}
              onClick={handleDeleteButtonClick}
              data-tip={t('tooltips.delete')}
            >
              {isConfirmingDelete ? t('actions.confirmDeleteFeedback') : t('actions.deleteSuggestedAnswer')}
            </button>
            <button type="submit" className="btn btn-primary btn-sm" data-tip={t('tooltips.send')}>
              {t('actions.confirm')}
            </button>
          </div>
        </form>
      </div>
      {/* modal-dropback ? */}
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button type="button" onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  )
}
