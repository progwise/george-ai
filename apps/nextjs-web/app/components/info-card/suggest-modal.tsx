'use client'

import { getClient } from '@/app/client/urql-client'
import { graphql } from '@/src/gql'
import { useEffect, useRef, useState } from 'react'

export const SuggestModal = ({
  title,
  summaryId,
}: {
  title: string
  summaryId: string
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const formRef = useRef(null)
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isModalOpen])
  const handleSubmit = async () => {
    console.log('formRef: ', formRef)

    // try {
    //   await getClient().mutation(
    //     graphql(`
    //       mutation CreateProposalSummary(
    //         $proposalSummary: String!
    //         $summaryId: String!
    //       ) {
    //         createProposalSummary(
    //           data: { proposalSummary: $proposalSummary, summaryId: $summaryId }
    //         ) {
    //           id
    //         }
    //       }
    //     `),
    //     {
    //       proposalSummary,
    //       summaryId,
    //     },
    //   )
    // } catch (error) {
    //   console.error('Error while creating proposal summary :', error)
    // }
  }

  return (
    <div className="flex justify-center">
      <button
        onClick={() => setIsModalOpen(!isModalOpen)}
        className="border border-blue-500 text-xs rounded-md px-4 bg-slate-100 hover:bg-slate-300"
      >
        Suggest proposal
      </button>
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-2xl max-h-full"
          >
            <div className="relative bg-white rounded-md shadow ">
              <h3 className="font-bold text-lg p-4 border-b">{title}</h3>
              <div className="p-6 h-64">
                <textarea
                  name="proposalSummary"
                  className="border rounded-md p-2 w-full h-full resize-none"
                  placeholder="Enter your proposal"
                />
              </div>
              <div className="flex gap-4 items-center justify-end p-4 border-t">
                <button
                  type="submit"
                  className="text-white bg-blue-500 hover:bg-blue-800 font-medium rounded-md text-sm px-4 py-2"
                >
                  Submit
                </button>
                <button
                  onClick={() => setIsModalOpen(!isModalOpen)}
                  className="bg-white hover:bg-slate-300 rounded-md border text-sm font-medium px-4 py-2 "
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
