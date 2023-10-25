'use client'

import { graphql } from '@/src/gql'
import { useEffect, useRef, useState } from 'react'
import { useMutation } from 'urql'
import { ModalForm } from './suggest-modal-form'
import { ModalToast } from './suggest-modal-toast'

interface SuggestModalrops {
  title: string
  summaryId: string
  locales: string[]
}

export const SuggestModal = ({
  title,
  summaryId,
  locales,
}: SuggestModalrops) => {
  const formReference = useRef<HTMLFormElement | null>(null)
  const [textValue, setTextValue] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState('en')

  const [{ data, fetching, error }, createProposalSummary] = useMutation(
    graphql(`
      mutation CreateProposalSummary(
        $proposalSummary: String!
        $summaryId: String!
        $selectedLocale: String!
      ) {
        createProposalSummary(
          data: {
            proposalSummary: $proposalSummary
            summaryId: $summaryId
            locale: $selectedLocale
          }
        ) {
          id
        }
      }
    `),
  )

  useEffect(() => {
    if (data) {
      setTextValue('')
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 3000)
    }
    if (error) {
      setShowErrorToast(true)
      setTimeout(() => {
        setShowErrorToast(false)
      }, 3000)
    }
  }, [data, error])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formReference.current) {
      return
    }
    const formData = new FormData(formReference.current)
    const proposalSummary = formData.get('proposalSummary')
    if (typeof proposalSummary !== 'string') {
      return
    }

    await createProposalSummary({
      proposalSummary,
      summaryId,
      selectedLocale,
    })
  }

  return (
    <div className="flex justify-center">
      <button
        className="btn btn-outline btn-accent btn-sm"
        onClick={() => {
          const modal = document.querySelector(`#modal_${summaryId}`)
          if (modal instanceof HTMLDialogElement) {
            modal.showModal()
          }
        }}
      >
        Suggest proposal
      </button>
      <dialog id={`modal_${summaryId}`} className="modal modal-xl shadow-xl">
        <div className="modal-box max-w-2xl p-0">
          <ModalForm
            key={`modalForm_${summaryId}`}
            handleSubmit={handleSubmit}
            fetching={fetching}
            title={title}
            formReference={formReference}
            summaryId={summaryId}
            textValue={textValue}
            setTextValue={setTextValue}
            locales={locales}
            setSelectedLocale={setSelectedLocale}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setTextValue('')}>close</button>
        </form>
        <ModalToast
          showSuccessToast={showSuccessToast}
          showErrorToast={showErrorToast}
          error={error}
        />
      </dialog>
    </div>
  )
}
