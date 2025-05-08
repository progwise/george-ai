import { useTranslation } from '../../i18n/use-translation-hook'
import { ImpressDe } from './impress-de'
import { ImpressEn } from './impress-en'

export const Impress = () => {
  const { language } = useTranslation()
  if (language === 'de') {
    return <ImpressDe />
  }
  return <ImpressEn />
}
