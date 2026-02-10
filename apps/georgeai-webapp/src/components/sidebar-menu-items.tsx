import { Link } from '@tanstack/react-router'
import { ReactNode, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../i18n/use-translation-hook'
import { PlusIcon } from '../icons/plus-icon'
import { FileRoutesByTo } from '../routeTree.gen'
import { NewAutomationDialog } from './automations/new-automation-dialog'
import { NewLibraryDialog } from './library/new-library-dialog'
import { NewListDialog } from './lists/new-list-dialog'

interface SidebarNavigationLinkProps {
  to: keyof FileRoutesByTo
  icon: ReactNode
  label: string
  className?: string
}

export const SidebarNavigationLink = ({ to, icon, label, className }: SidebarNavigationLinkProps) => (
  <Link
    to={to}
    className={twMerge('rounded-lg transition-colors is-drawer-close:tooltip is-drawer-close:tooltip-right', className)}
    data-tip={label}
    inactiveProps={{ className: 'hover:animate-pulse' }}
    activeProps={{ className: 'bg-accent/40' }}
    activeOptions={{ exact: false }}
  >
    {icon}
    <span className="is-drawer-close:hidden">{label}</span>
  </Link>
)

interface SidebarCollapsibleMenuProps {
  icon: ReactNode
  label: string
  items: Array<{ id: string; name: string }>
  isDrawerOpen: boolean
  to: keyof FileRoutesByTo
  renderItemLink: (item: { id: string; name: string }) => ReactNode
  groupName: string
}

export const ListSidebarCollapsibleMenu = ({
  icon,
  label,
  items,
  isDrawerOpen,
  to,
  renderItemLink,
  groupName,
}: SidebarCollapsibleMenuProps) => {
  const { t } = useTranslation()

  const newLibraryDialogRef = useRef<HTMLDialogElement | null>(null)
  const newListDialogRef = useRef<HTMLDialogElement | null>(null)
  const newAutomationDialogRef = useRef<HTMLDialogElement | null>(null)

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

  const createClass = {
    libraries: newLibraryDialogRef,
    lists: newListDialogRef,
    automations: newAutomationDialogRef,
  }[groupName]

  return (
    <>
      <li className={`${groupClass}`}>
        {isDrawerOpen ? ( // Opened sidebar
          items.length > 0 ? (
            <details className="rounded-lg">
              <summary>
                {icon}
                {label}
                <li>
                  <button
                    type="button"
                    onClick={() => createClass?.current?.showModal()}
                    className="btn rounded-lg btn-ghost btn-sm btn-success hover:tooltip max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info" // TODO: tooltip behind elements, fix
                    data-tip={t('test.test1')}
                  >
                    <PlusIcon className="size-4" />
                  </button>
                </li>
              </summary>
              <ul>
                {items.map((item) => (
                  <li key={item.id}>{renderItemLink(item)}</li>
                ))}
              </ul>
            </details>
          ) : (
            // TODO: considering moving button as optional to SidebarNavigationLink AND cleanup.
            <Link to={to} className="flex items-center gap-2 pr-6.5">
              {icon}
              {label}
              <button
                type="button"
                onClick={() => createClass?.current?.showModal()}
                className="btn ml-auto rounded-lg btn-ghost btn-sm btn-success hover:tooltip max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
                data-tip={t('test.test2')}
              >
                <PlusIcon className="size-4" />
              </button>
            </Link>
          )
        ) : (
          // Closed sidebar
          <>
            {items.length > 0 ? (
              <>
                <SidebarNavigationLink to={to} icon={icon} label="" />
                <ul
                  className={`invisible absolute top-0 left-10 min-w-96 rounded-box bg-base-200 p-2 opacity-0 transition-all duration-200 not-[&:hover]:delay-300 ${hoverClass} before:hidden`}
                >
                  {items.map((item) => (
                    <li key={item.id}>{renderItemLink(item)}</li>
                  ))}
                </ul>
              </>
            ) : (
              <SidebarNavigationLink to={to} icon={icon} label={label} />
            )}
          </>
        )}
      </li>
      <NewLibraryDialog ref={newLibraryDialogRef} />
      <NewListDialog ref={newListDialogRef} />
      <NewAutomationDialog ref={newAutomationDialogRef} />
    </>
  )
}
