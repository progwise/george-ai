import { useState } from 'react'

interface DropdownOption {
  title: string
  action: () => void
  key?: string
}

interface DropdownProps {
  title: string
  options: DropdownOption[]
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
        tabIndex={0}
        className="btn m-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      {isOpen && (
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
        >
          {options.map((option) => {
            const itemKey = option.key ?? option.title
            return (
              <li key={itemKey}>
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
