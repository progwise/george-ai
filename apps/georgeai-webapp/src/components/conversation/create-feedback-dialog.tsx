import { RefObject } from 'react'
import React from 'react'
import z from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { useTranslation } from '../../i18n/use-translation-hook'
import { Input } from '../form/input'
import { toastWarning } from '../georgeToaster'
import { Message } from './conversation-message'

export interface Feedback {
  originalContext: string
  originalAnswer: string
  feedback: 'positive' | 'negative'
  answerMessageId: string
  feedbackSuggestion?: string | undefined
  answerAssistantId?: string | undefined
  answerUserId?: string | undefined
  languageModel?: string | undefined
}

interface CreateFeedbackDialogProps {
  ref: RefObject<HTMLDialogElement | null>
  feedback: { feedback: 'positive' | 'negative' | undefined }
  message: Message
  onSubmit: (
    data: {
      originalContext: string
      originalAnswer: string
      feedback: 'positive' | 'negative'
      answerMessageId: string
      feedbackSuggestion?: string | undefined
      answerAssistantId?: string | undefined
      answerUserId?: string | undefined
      languageModel?: string | undefined
    } | null,
  ) => void
  messageContext: string
}

const getFormSchema = () =>
  z.object({
    originalContext: z.string().min(2),
    originalAnswer: z.string().min(2),
    feedback: z.enum(['positive', 'negative']),
    answerMessageId: z.string().nonempty(),
    feedbackSuggestion: z.string().optional(),
    answerAssistantId: z.string().optional(),
    answerUserId: z.string().optional(),
    languageModel: z.string().optional(),
  })

export type CreateFeedbackFormInput = z.infer<ReturnType<typeof getFormSchema>>

export const CreateFeedbackDialog = ({
  ref,
  feedback,
  message,
  onSubmit,
  messageContext: history,
}: CreateFeedbackDialogProps) => {
  const { t } = useTranslation()
  const formSchema = getFormSchema()

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
    ref.current?.close()
  }

  return (
    <dialog className="modal" ref={ref}>
      <div className={'modal-box flex flex-col'}>
        <h3 className="text-lg font-bold">
          {feedback.feedback === 'positive'
            ? t('conversations.createPositiveFeedbackTitel')
            : t('conversations.createNegativeFeedbackTitel')}
        </h3>
        <p className="m-2 py-4">{t('texts.createFeedbackDescription')}</p>
        <form method="dialog" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <input type="hidden" name="originalContext" value={history} />
          <input type="hidden" name="originalAnswer" value={message.content} />
          <input type="hidden" name="feedback" value={feedback.feedback || ''} />
          <input type="hidden" name="answerMessageId" value={message.id} />

          {message.sender.isBot && message.sender.assistant && (
            <input type="hidden" name="answerAssistantId" value={message.sender.assistantId} />
          )}
          {!message.sender.isBot && message.sender.user && (
            <input type="hidden" name="answerUserId" value={message.sender.user.id || ''} />
          )}
          {message.sender.isBot && message.sender.assistant && (
            <input type="hidden" name="languageModel" value={message.sender.assistant.languageModel || ''} />
          )}
          <Input label={t('labels.alternativeAnswerSuggestion')} name="feedbackSuggestion" schema={formSchema} />
          {/* button area: */}
          <div className="modal-action flex justify-end gap-2">
            <button type="button" className="btn btn-sm" onClick={handleClose}>
              {t('actions.cancel')}
            </button>
            <button type="submit" className="btn btn-primary btn-sm" data-tip={t('tooltips.sendFeedback')}>
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
