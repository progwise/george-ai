import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'

import { FileRoutesByTo } from '../../routeTree.gen'

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
    inactiveProps={{ className: 'hover:bg-base-300' }}
    activeProps={{ className: 'bg-accent/40' }}
    activeOptions={{ exact: false }}
  >
    <div className="shrink-0 pl-4">{icon}</div>
    <span className="is-drawer-close:hidden">{label}</span>
  </Link>
)
