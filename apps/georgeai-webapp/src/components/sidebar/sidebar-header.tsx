import { Link } from '@tanstack/react-router'

import { useTranslation } from '../../i18n/use-translation-hook'
import { BowlerLogoIcon } from '../../icons/bowler-logo-icon'
import { SidebarToggleIcon } from '../../icons/sidebar-toggle-icon'

interface SidebarHeaderProps {
  isDrawerOpen: boolean
}

export function SidebarHeader({ isDrawerOpen }: SidebarHeaderProps) {
  const { t } = useTranslation()
  const sidebarToggleTooltip = isDrawerOpen ? t('sidebar.close') : t('sidebar.open')

  return (
    <div className="relative flex h-12 shrink-0 items-center px-4.5">
      <Link to="/" className="flex items-center gap-2">
        <BowlerLogoIcon className="size-5 shrink-0" />
        <span className="font-extrabold is-drawer-close:hidden">George</span>
      </Link>

      <label
        htmlFor="sidebar"
        aria-label={sidebarToggleTooltip}
        className="tooltip btn absolute tooltip-bottom top-1/2 right-0 z-10 btn-square -translate-y-1/2 rounded-lg bg-base-200 btn-ghost is-drawer-close:invisible is-drawer-close:tooltip-right is-drawer-close:right-2 is-drawer-close:group-hover/sidebar:visible is-drawer-open:pointer-events-auto is-drawer-open:hover:cursor-w-resize"
        data-tip={sidebarToggleTooltip}
      >
        <SidebarToggleIcon className="size-5" />
      </label>
    </div>
  )
}
