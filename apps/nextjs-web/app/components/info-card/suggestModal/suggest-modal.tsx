'use client'

import { graphql } from '@/src/gql'
import { useEffect, useRef, useState } from 'react'
import { useMutation } from 'urql'
import { ModalForm } from './suggest-modal-form'
import { ModalToast } from './suggest-modal-toast'

interface SuggestModalrops {
  title: string
  summaryId: string
  summary: string
}

export const SuggestModal = ({
  title,
  summaryId,
  summary,
}: SuggestModalrops) => {
  const [textValue, setTextValue] = useState(summary)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)

  const [{ data, fetching, error }, createProposalSummary] = useMutation(
    graphql(`
      mutation CreateProposalSummary(
        $proposalSummary: String!
        $summaryId: String!
      ) {
        createProposalSummary(
          data: { proposalSummary: $proposalSummary, summaryId: $summaryId }
        ) {
          id
        }
      }
    `),
  )

  useEffect(() => {
    if (data) {
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
    await createProposalSummary({
      proposalSummary: textValue,
      summaryId,
    })
  }

  return (
    <div className="flex justify-center">
      <button
        className="btn btn-outline btn-accent btn-sm hover:text-white"
        onClick={() => {
          const modal = document.querySelector(`#modal_${summaryId}`)
          if (modal instanceof HTMLDialogElement) {
            modal.showModal()
          }
        }}
      >
        Suggest proposal
      </button>
      <dialog
        id={`modal_${summaryId}`}
        className="modal modal-xl drop-shadow-2xl"
      >
        <div className="modal-box max-w-2xl p-0">
          <ModalForm
            key={`modalForm_${summaryId}`}
            handleSubmit={handleSubmit}
            fetching={fetching}
            title={title}
            summaryId={summaryId}
            textValue={textValue}
            setTextValue={setTextValue}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
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
