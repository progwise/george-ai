'use client'

import Loading from '@/app/loading'
import { graphql } from '@/src/gql'
import { useEffect, useRef, useState } from 'react'
import { useMutation } from 'urql'
import { ModalForm } from './modal-form'

export const SuggestModal = ({
  title,
  summaryId,
}: {
  title: string
  summaryId: string
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const formReference = useRef<HTMLFormElement | null>(null)
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
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isModalOpen])

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
    })
  }

  return (
    <div className="flex justify-center">
      <button
        onClick={() => setIsModalOpen(true)}
        className="border border-blue-500 text-xs rounded-md px-4 bg-slate-100 hover:bg-slate-300"
      >
        Suggest proposal
      </button>
      {isModalOpen && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false)
            }
          }}
          className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <ModalForm
            handleSubmit={handleSubmit}
            data={!!data}
            fetching={fetching}
            error={error}
            title={title}
            setIsModalOpen={setIsModalOpen}
            formReference={formReference}
          />
        </div>
      )}
    </div>
  )
}
