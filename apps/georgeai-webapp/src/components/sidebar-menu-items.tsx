import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import { FileRoutesByTo } from '../routeTree.gen'

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
    <li className={`${groupClass} relative`}>
      {isDrawerOpen ? (
        items.length > 0 ? (
          <details className="rounded-lg">
            <summary>
              {icon}
              {label}
            </summary>
            <ul>
              {items.map((item) => (
                <li key={item.id}>{renderItemLink(item)}</li>
              ))}
            </ul>
          </details>
        ) : (
          <SidebarNavigationLink to={to} icon={icon} label={label} />
        )
      ) : (
        <>
          <SidebarNavigationLink to={to} icon={icon} label="" />
          {items.length > 0 && (
            <ul
              className={`invisible absolute top-0 left-10 min-w-96 rounded-box bg-base-200 p-2 opacity-0 transition-all duration-200 not-[&:hover]:delay-200 ${hoverClass} before:hidden`}
            >
              {items.map((item) => (
                <li key={item.id}>{renderItemLink(item)}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  )
}
