import { useTranslation } from '../i18n/use-translation-hook'
import { toastError, toastSuccess } from './georgeToaster'

export const useClipboard = () => {
  const { t } = useTranslation()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toastSuccess(t('texts.copiedToClipboard'))
    } catch (error) {
      toastError(`${t('errors.copyFailed')}: ${error}`)
    }
  }

  return { copyToClipboard }
}
