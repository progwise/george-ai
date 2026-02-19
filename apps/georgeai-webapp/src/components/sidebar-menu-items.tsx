import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'

import { useTranslation } from '../i18n/use-translation-hook'
import { PlusIcon } from '../icons/plus-icon'
import { FileRoutesByTo } from '../routeTree.gen'

interface CreateNewItemButtonProps {
  newDialogRef: React.RefObject<HTMLDialogElement | null>
  createNewItemTooltip: string
  hoverClass: string
}

const CreateNewItemButton = ({ newDialogRef, createNewItemTooltip, hoverClass }: CreateNewItemButtonProps) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      newDialogRef.current?.showModal()
    }}
    className={`tooltip btn right-2 ml-auto btn-circle shrink-0 opacity-0 btn-ghost transition-opacity btn-xs [&::before]:text-xs ${hoverClass}`}
    data-tip={createNewItemTooltip}
  >
    <PlusIcon className="size-4" />
  </button>
)

interface SidebarNavigationLinkProps {
  to: keyof FileRoutesByTo
  icon: ReactNode
  label: string
}

export const SidebarNavigationLink = ({ to, icon, label }: SidebarNavigationLinkProps) => (
  <Link
    to={to}
    className="mx-1 flex h-9 items-center gap-2 rounded-lg text-sm transition-colors is-drawer-close:tooltip is-drawer-close:tooltip-right"
    data-tip={label}
    inactiveProps={{ className: 'hover:animate-pulse' }}
    activeProps={{ className: 'bg-accent/40' }}
    activeOptions={{ exact: false }}
  >
    <div className="shrink-0 pl-4">{icon}</div>
    <span className="is-drawer-close:hidden">{label}</span>
  </Link>
)

interface ListSidebarCollapsibleMenuProps {
  icon: ReactNode
  label: string
  items: Array<{ id: string; name: string }>
  isDrawerOpen: boolean
  to: keyof FileRoutesByTo
  renderItemLink: (item: { id: string; name: string }) => ReactNode
  groupName: 'libraries' | 'lists' | 'automations'
  newItemDialogRef: React.RefObject<HTMLDialogElement | null>
}

export const ListSidebarCollapsibleMenu = ({
  icon,
  label,
  items,
  isDrawerOpen,
  to,
  renderItemLink,
  groupName,
  newItemDialogRef: newDialogRef,
}: ListSidebarCollapsibleMenuProps) => {
  const { t } = useTranslation()

  const createNewItemTooltip = t(`${groupName}.createNew`)

  const groupClass = {
    libraries: 'group/libraries',
    lists: 'group/lists',
    automations: 'group/automations',
  }[groupName]

  const hoverClass = {
    libraries: 'group-hover/libraries:visible group-hover/libraries:opacity-100',
    lists: 'group-hover/lists:visible group-hover/lists:opacity-100',
    automations: 'group-hover/automations:visible group-hover/automations:opacity-100',
  }[groupName]

  return (
    <>
      <li className={`${groupClass}`}>
        {isDrawerOpen ? ( // Opened sidebar
          items.length > 0 ? (
            <div className="collapse rounded-lg pl-5 text-sm">
              <input type="checkbox" className="pointer-events-none" />
              <div
                className="collapse-title flex items-center gap-2 px-0 py-1.5 text-sm"
                onClick={(e) => {
                  const collapse = e.currentTarget.closest('.collapse')
                  collapse?.classList.toggle('collapse-open')
                }}
              >
                {icon}
                {label}
                <CreateNewItemButton
                  newDialogRef={newDialogRef}
                  createNewItemTooltip={createNewItemTooltip} // next fix
                  hoverClass={hoverClass}
                />
              </div>
              <div className="collapse-content p-0">
                {items.map((item) => (
                  <div key={item.id}>{renderItemLink(item)}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative flex h-9 items-center rounded-lg text-sm">
              <Link
                to={to}
                className="flex h-full flex-1 items-center gap-2 rounded-lg pl-5 before:absolute before:inset-x-1 before:inset-y-0 before:rounded-lg"
                activeProps={{ className: 'before:bg-accent/40' }}
              >
                <span className="z-10 flex items-center gap-2">
                  {icon}
                  <span className="truncate">{label}</span>
                </span>
              </Link>

              <CreateNewItemButton
                newDialogRef={newDialogRef}
                createNewItemTooltip={createNewItemTooltip}
                hoverClass={hoverClass}
              />
            </div>
          )
        ) : (
          // Closed sidebar
          <>
            {items.length > 0 ? (
              <div className="relative text-sm">
                <SidebarNavigationLink to={to} icon={icon} label="" />
                <ul
                  className={`invisible absolute -top-1.5 left-15 min-w-96 cursor-default rounded-box bg-base-200 p-1 opacity-0 transition-all duration-200 not-[&:hover]:delay-300 ${hoverClass} before:hidden`}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  {items.map((item) => (
                    <li key={item.id}>{renderItemLink(item)}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <SidebarNavigationLink to={to} icon={icon} label={label} />
            )}
          </>
        )}
      </li>
    </>
  )
}
