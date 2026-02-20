import { Link } from '@tanstack/react-router'

import { ItemActionsDropdown } from './item-actions-dropdown'

interface SidebarNavItemsProps {
  items: Array<{ id: string; name: string }>
  groupName: 'libraries' | 'lists' | 'automations'
  getLink: (item: { id: string; name: string }) => { to: string; params: Record<string, string> }
}
export function SidebarNavItems({ items, groupName, getLink }: SidebarNavItemsProps) {
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
    </>
  )
}
