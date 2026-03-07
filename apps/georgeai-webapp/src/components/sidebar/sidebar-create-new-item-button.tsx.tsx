import { PlusIcon } from '../../icons/plus-icon'

interface SidebarCreateNewItemButtonProps {
  newItemDialogRef: React.RefObject<HTMLDialogElement | null>
  createNewItemTooltip: string
  hoverClass: string
}

export const SidebarCreateNewItemButton = ({
  newItemDialogRef,
  createNewItemTooltip,
  hoverClass,
}: SidebarCreateNewItemButtonProps) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      newItemDialogRef.current?.showModal()
    }}
    className={`tooltip btn tooltip-left right-2 z-20 ml-auto btn-circle shrink-0 opacity-0 btn-ghost btn-xs [&::before]:text-xs ${hoverClass}`}
    data-tip={createNewItemTooltip}
  >
    <PlusIcon />
  </button>
)
