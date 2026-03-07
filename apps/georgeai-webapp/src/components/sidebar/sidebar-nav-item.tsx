import { Link } from '@tanstack/react-router'

import { PlusIcon } from '../../icons/plus-icon'
import { SearchIcon } from '../../icons/search-icon'
import { ItemActionsDropdown } from './item-actions-dropdown'

interface SidebarNavItemsProps {
  items: Array<{ id: string; name: string }>
  groupName: 'libraries' | 'lists' | 'automations'
  getLink: (item: { id: string; name: string }) => { to: string; params: Record<string, string> }
  count: number
  newItemDialogRef: React.RefObject<HTMLDialogElement | null>
  createNewItemTooltip: string
}

export function SidebarNavItems({
  items,
  groupName,
  getLink,
  count,
  newItemDialogRef,
  createNewItemTooltip,
}: SidebarNavItemsProps) {
  return (
    <>
      {items.map((item) => (
        <li
          key={item.id}
          className="group flex flex-row items-center rounded-lg py-0 hover:bg-base-300 has-[a[data-status='active']]:bg-accent/40"
        >
          <Link {...getLink(item)} className="block h-8 grow content-center pl-3">
            {item.name}
          </Link>
          <div className="is-drawer-close:hidden">
            <ItemActionsDropdown item={item} groupName={groupName} />
          </div>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            newItemDialogRef.current?.showModal()
          }}
          className="group mb-0.5 flex h-8.5 w-full items-center justify-start gap-1 rounded-lg py-0 pl-2.5 font-normal text-base-content/75 hover:bg-success/45 hover:text-base-content"
        >
          <PlusIcon />
          <span>{createNewItemTooltip}</span>
        </button>
      </li>

      {items.length < count && (
        <li>
          <Link
            to="/search"
            className="group mb-0.5 flex h-8.5 items-center gap-1 rounded-lg py-0 pl-3 text-base-content/75 hover:bg-info/50 hover:text-base-content"
          >
            <SearchIcon />
            <span>
              {count - items.length} more {groupName}
            </span>
          </Link>
        </li>
      )}
    </>
  )
}
