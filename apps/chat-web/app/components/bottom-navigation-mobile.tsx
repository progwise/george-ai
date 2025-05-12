import { Link } from '@tanstack/react-router'

import { useTranslation } from '../i18n/use-translation-hook'
import AcademicCapIcon from '../icons/academic-cap-icon'
import BowlerHatIcon from '../icons/bowler-hat-icon'
import { ConversationIcon } from '../icons/conversation-icon'

const BottomNavigationMobile = () => {
  const { t } = useTranslation()

  return (
    <div className="dock z-40 lg:hidden">
      <Link to="/conversations" activeProps={{ className: 'dock-active' }}>
        <ConversationIcon className="size-6" />
        <span className="dock-label">{t('topNavigation.conversations')}</span>
      </Link>
      <Link to="/assistants" activeProps={{ className: 'dock-active' }}>
        <BowlerHatIcon className="size-6" />
        <span className="dock-label">{t('topNavigation.assistants')}</span>
      </Link>
      <Link to="/libraries" activeProps={{ className: 'dock-active' }}>
        <AcademicCapIcon className="size-6" />
        <span className="dock-label">{t('topNavigation.libraries')}</span>
      </Link>
    </div>
  )
}

export default BottomNavigationMobile
