import { useState } from 'react'

interface DropdownProps {
  title: string
  options: Array<{
    title: string
    action: () => void
    key?: string
  }>
}

export const Dropdown = ({ title, options }: DropdownProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOptionClick = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn m-1 w-52"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      {isOpen && (
        <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          {options.map((option) => {
            return (
              <li key={option.key ?? option.title}>
                <button
                  type="button"
                  className="text-left"
                  onClick={() => handleOptionClick(option.action)}
                >
                  {option.title}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
