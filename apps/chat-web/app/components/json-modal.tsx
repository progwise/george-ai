import React, { useState } from 'react'

import { safeJsonParse } from '@george-ai/web-utils'

import { ArrayIcon } from '../icons/array-icon'
import { ObjectIcon } from '../icons/object-icon'

interface JsonModalProps {
  title: string
  data: string
  ref?: React.Ref<HTMLDialogElement>
}

export const ObjectBranch = (props: { title: string; path: string[]; data: object }) => {
  const { title, path, data } = props
  const newPath = [...path, title]

  const properties = Object.keys(data) as Array<keyof typeof data>
  const [isOpen, setIsOpen] = useState(false)
  return (
    <li>
      <h2>
        <button type="button" onClick={() => setIsOpen((prev) => !prev)} className="btn btn-ghost btn-xs">
          {isOpen ? '▼' : '▶'}
        </button>
        <div className="border-base-content/20 flex justify-between border-b border-dotted">
          <div className="flex items-center gap-2">
            <ObjectIcon className="size-4" />
            {title}
          </div>
          <span className="ml-1 font-mono text-xs opacity-60">(Object with {properties.length} properties)</span>
        </div>
      </h2>
      {isOpen && (
        <ul>
          {properties.map((property) => (
            <Branch
              key={`${[...path, property].join('/')}`}
              title={`${property}`}
              data={data[property]}
              path={newPath}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export const ArrayBranch = (props: { title: string; path: string[]; data: Array<unknown> }) => {
  const { title, path, data } = props
  const newPath = [...path, title]
  const [isOpen, setIsOpen] = useState(false)
  return (
    <li>
      <h2>
        <button type="button" onClick={() => setIsOpen((prev) => !prev)} className="btn btn-ghost btn-xs">
          {isOpen ? '▼' : '▶'}
        </button>
        <div className="border-base-content/20 flex justify-between border-b border-dotted">
          <div className="flex items-center gap-2">
            <ArrayIcon className="size-4" />
            {title}
          </div>
          <span className="ml-1 font-mono text-xs opacity-60">
            {title} [Array of {data.length}]
          </span>
        </div>
      </h2>
      {isOpen && (
        <ul>
          {data.map((item, index) => (
            <Branch key={`${[...newPath, index].join('/')}`} title={`${index}`} data={item} path={newPath} />
          ))}
        </ul>
      )}
    </li>
  )
}

export const Branch = ({ title, path, data }: { title: string; path: string[]; data: unknown }) => {
  if (Array.isArray(data)) {
    return <ArrayBranch title={title} path={[...path, title]} data={data} />
  }

  if (data && typeof data === 'object') {
    return <ObjectBranch title={title} path={[...path, title]} data={data as object} />
  }

  // Handle primitive values
  const textValue = data === undefined || data === null ? '-' : data.toString()

  return (
    <li className="max-w-full">
      <div className="ml-4 flex flex-wrap items-center gap-2 font-mono text-xs">
        <div className="badge badge-xs badge-outline">{title}</div>
        <div className="max-h-50 overflow-auto overflow-x-auto">
          <pre className="whitespace-pre-line">{textValue}</pre>
        </div>
      </div>
    </li>
  )
}

export const JsonModal = ({ title, data, ref }: JsonModalProps) => {
  const [viewMode, setViewMode] = useState<'structured' | 'source'>('structured')
  const parseResult = safeJsonParse(data)
  const jsonData = parseResult.success ? JSON.parse(data) : { error: 'Invalid JSON', data }
  const isValidJson = parseResult.success

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box flex h-[80vh] max-w-5xl flex-col">
        {/* Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="tabs tabs-boxed tabs-sm">
              <button
                type="button"
                className={`tab ${viewMode === 'structured' ? 'tab-active' : ''}`}
                onClick={() => setViewMode('structured')}
              >
                📋 Structured
              </button>
              <button
                type="button"
                className={`tab ${viewMode === 'source' ? 'tab-active' : ''}`}
                onClick={() => setViewMode('source')}
              >
                📄 Source
              </button>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {!isValidJson && (
          <div className="alert alert-error mb-4 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Invalid JSON format - showing raw data</span>
          </div>
        )}

        {/* Content */}
        <div className="bg-base-200 min-h-0 flex-1 overflow-auto rounded-lg p-4">
          {viewMode === 'structured' && isValidJson ? (
            <ul className="menu menu-sm w-full">
              {Object.keys(jsonData).map((key) => (
                <Branch key={key} title={key} data={jsonData[key]} path={[]} />
              ))}
            </ul>
          ) : (
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
              {isValidJson ? JSON.stringify(jsonData, null, 2) : data}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action shrink-0">
          {isValidJson && (
            <div className="text-base-content/60 mr-auto text-sm">
              {typeof jsonData === 'object' && jsonData !== null
                ? `${Object.keys(jsonData).length} properties`
                : `Type: ${typeof jsonData}`}
            </div>
          )}
          <form method="dialog">
            <button type="submit" className="btn btn-primary">
              Close
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  )
}
