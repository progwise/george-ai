import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { ChevronDownIcon } from '../../icons/chevron-down-icon'
import { FileRoutesByTo } from '../../routeTree.gen'
import { SidebarCreateNewItemButton } from './sidebar-create-new-item-button.tsx'
import { SidebarNavItems } from './sidebar-nav-item'
import { SidebarNavigationLink } from './sidebar-navigation-link'

interface SidebarNavGroupProps {
  icon: ReactNode
  label: string
  items: Array<{ id: string; name: string }>
  isDrawerOpen: boolean
  to: keyof FileRoutesByTo
  groupName: 'libraries' | 'lists' | 'automations'
  newItemDialogRef: React.RefObject<HTMLDialogElement | null>
  getLink: (item: { id: string; name: string }) => { to: string; params: Record<string, string> }
}

export const SidebarNavGroup = ({
  icon,
  label,
  items,
  isDrawerOpen,
  to,
  groupName,
  newItemDialogRef,
  getLink,
}: SidebarNavGroupProps) => {
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
                <span className="flex items-center gap-0.75">
                  {label}
                  <ChevronDownIcon className="size-2.5 shrink-0 -rotate-90 in-[.collapse-open]:rotate-0" />
                </span>
                <SidebarCreateNewItemButton
                  newItemDialogRef={newItemDialogRef}
                  createNewItemTooltip={createNewItemTooltip}
                  hoverClass={hoverClass}
                />
              </div>
              <div className="collapse-content p-0">
                <SidebarNavItems items={items} groupName={groupName} getLink={getLink} />
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

              <SidebarCreateNewItemButton
                newItemDialogRef={newItemDialogRef}
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
                  <SidebarNavItems items={items} groupName={groupName} getLink={getLink} />
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
