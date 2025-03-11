import React from 'react'

import { AiAssistant } from '../../gql/graphql'

export interface AssistantEditFormProps {
  assistant: AiAssistant
  ownerId: string
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  disabled: boolean
}

export const AssistantForm = ({
  assistant,
  ownerId,
  handleSubmit,
  disabled,
}: AssistantEditFormProps): React.ReactElement => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="hidden" name="ownerId" value={ownerId} />
      <input type="hidden" name="url" value="wasauchimmer" />
      <input type="hidden" name="assistantId" value={assistant.id} />
      <label className="form-control w-full max-w-xs">
        <input type="file" accept="image/*" name="icon" className="file-input file-input-bordered w-full max-w-xs" />
      </label>
      <label className="input input-bordered flex items-center gap-2">
        Name your assistant:
        <input
          key={assistant.name}
          name="name"
          type="text"
          defaultValue={assistant.name}
          className="grow"
          placeholder="George II"
          required
        />
      </label>
      <textarea
        key={assistant.description}
        name="description"
        className="textarea textarea-bordered w-full flex-grow"
        placeholder="Born and brought up in northern Germany, George is the most recent British monarch born outside Great Britain."
        defaultValue={assistant.description || ''}
      ></textarea>
      <div className="flex gap-2">
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text pr-4">Chatbot</span>
            <input
              key={assistant.assistantType}
              type="radio"
              name="assistantType"
              value="CHATBOT"
              className="radio checked:bg-green-500"
              defaultChecked={assistant.assistantType === 'CHATBOT'}
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text pr-4">Doc Generator</span>
            <input
              key={assistant.assistantType}
              type="radio"
              name="assistantType"
              value="DOCUMENT_GENERATOR"
              className="radio checked:bg-blue-500"
              defaultChecked={assistant.assistantType === 'DOCUMENT_GENERATOR'}
              disabled
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button disabled={disabled} type="submit" className="btn btn-primary btn-sm">
          Save
        </button>
      </div>
    </form>
  )
}
