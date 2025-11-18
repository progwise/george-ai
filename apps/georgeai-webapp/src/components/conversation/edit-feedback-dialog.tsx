import { RefObject, useState } from 'react'
import React from 'react'
import z from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { useTranslation } from '../../i18n/use-translation-hook'
import { Input } from '../form/input'
import { toastWarning } from '../georgeToaster'
import { Message } from './conversation-message'

interface EditFeedbackDialogProps {
  ref: RefObject<HTMLDialogElement | null>
  message: Message
  onSubmit: (data: EditFeedbackFormInput) => void
  onDeleteButtonClick: (feedbackId: string) => void
}

const getFormSchema = () =>
  z.object({
    id: z.string().nonempty(),
    feedback: z.enum(['positive', 'negative']),
    feedbackSuggestion: z.string().optional(),
  })

export type EditFeedbackFormInput = z.infer<ReturnType<typeof getFormSchema>>

export const EditFeedbackDialog = ({ ref, message, onSubmit, onDeleteButtonClick }: EditFeedbackDialogProps) => {
  const { t } = useTranslation()
  const formSchema = getFormSchema()

  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false)
  const schema = React.useMemo(() => getFormSchema(), [])

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
        <h3 className="text-lg font-bold">{t('conversations.editFeedbackTitel')}</h3>
        <p className="m-2 py-4">{t('texts.editFeedbackDescription')}</p>
        <form method="dialog" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          {message.feedback && <input type="hidden" name="id" value={message.feedback.id} />}
          <div className="form-group bg-base-100 flex items-center gap-2 rounded-lg px-2 py-1 shadow">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="feedback"
                value="positive"
                defaultChecked={message.feedback?.feedback === 'positive'}
                className="radio radio-info radio-xs"
                aria-label="Feedback: positive"
              />
              <span title="Feedback: positive" tabIndex={-1} className="m-2">
                {t('labels.positiveFeedback')}
              </span>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="feedback"
                value="negative"
                defaultChecked={message.feedback?.feedback !== 'positive'}
                className="radio radio-info radio-xs"
                aria-label="Feedback: negative"
              />
              <span title="Feedback: negative" tabIndex={-1} className="m-2">
                {t('labels.negativeFeedback')}
              </span>
            </label>
          </div>
          <Input
            label={t('labels.alternativeAnswerSuggestion')}
            name="feedbackSuggestion"
            value={message.feedback?.feedbackSuggestion ? message.feedback.feedbackSuggestion : ''}
            schema={schema}
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
              {isConfirmingDelete ? t('actions.confirmDeleteFeedback') : t('actions.deleteFeedback')}
            </button>
            <button type="submit" className="btn btn-primary btn-sm" data-tip={t('tooltips.send')}>
              {t('actions.confirm')}
            </button>
          </div>
        </form>
      </div>
      {/* modal-backdrop ?? */}
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button type="button" onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  )
}
