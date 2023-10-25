'use client'

import Loading from '@/app/loading'
import { Dispatch, SetStateAction, useState } from 'react'

interface ModalFormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  fetching: boolean
  title: string
  summaryId: string
  textValue: string
  setTextValue: Dispatch<SetStateAction<string>>
  locales: string[]
  setSelectedLocale: Dispatch<SetStateAction<string>>
}

export const ModalForm = ({
  handleSubmit,
  fetching,
  title,
  summaryId,
  textValue,
  setTextValue,
  locales,
  setSelectedLocale,
}: ModalFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="card card-bordered card-body">
      <h3 className="card-title">{title}</h3>
      <div className="divider" />
      <div className="h-60">
        <div className="flex h-full items-center justify-center">
          {!fetching && (
            <textarea
              name="proposalSummary"
              className="textarea w-full h-full resize-none"
              placeholder="Enter your proposal"
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
            />
          )}
          {fetching && <Loading />}
        </div>
      </div>
      <div className="divider" />
      <div className="card-actions items-end justify-between">
        <div className="flexflex-col w-1/2">
          <span>Select the language of your proposal:</span>
          <div className="flex">
            {locales.map((locale) => (
              <label key={locale} className="label cursor-pointer gap-1">
                <span className="label-text capitalize">{locale}</span>
                <input
                  type="radio"
                  name="radio-10"
                  className="radio radio-accent"
                  // checked={selectedLocale === locale}
                  onChange={() => setSelectedLocale(locale)}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="join gap-0">
          <button
            type="submit"
            disabled={fetching || !textValue}
            className={`btn join-item w-24 ${
              fetching || !textValue ? 'btn-disabled' : 'btn-accent'
            }`}
          >
            Submit
          </button>
          <button
            type="button"
            className="btn join-item w-24 btn-outline"
            onClick={() => {
              setTextValue('')
              const modal = document.querySelector(`#modal_${summaryId}`)
              if (modal instanceof HTMLDialogElement) {
                modal.close()
              }
            }}
          >
            Close
          </button>
        </div>
      </div>
    </form>
  )
}
