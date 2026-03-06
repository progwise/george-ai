import { Link } from '@tanstack/react-router'

import { SearchIcon } from '../../icons/search-icon'
import { ItemActionsDropdown } from './item-actions-dropdown'

interface SidebarNavItemsProps {
  items: Array<{ id: string; name: string }>
  groupName: 'libraries' | 'lists' | 'automations'
  getLink: (item: { id: string; name: string }) => { to: string; params: Record<string, string> }
  count: number
}
export function SidebarNavItems({ items, groupName, getLink, count }: SidebarNavItemsProps) {
  return (
    <>
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex flex-row items-center rounded-lg py-0 pl-3 hover:bg-base-300 has-[a[data-status='active']]:bg-accent/40"
        >
          <Link {...getLink(item)} className="block h-8 grow content-center">
            {item.name}
          </Link>
          <div className="is-drawer-close:hidden">
            <ItemActionsDropdown item={item} groupName={groupName} />
          </div>
        </div>
      ))}
      {items.length < count && (
        <Link
          to="/search"
          className="group flex h-8 items-center rounded-lg py-0 pl-3 gap-1 text-base-content/75 hover:bg-accent/20 hover:text-base-content"
        >
          <SearchIcon />
          <span>
            {count - items.length} more {groupName}
          </span>
        </Link>
      )}
    </>
  )
}
