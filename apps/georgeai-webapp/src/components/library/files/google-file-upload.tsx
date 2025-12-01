import { useEffect, useRef, useState } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { CrossIcon } from '../../../icons/cross-icon'
import { FolderIcon } from '../../../icons/folder-icon'
import { PortalDialog } from '../../portal-dialog'
import { GoogleDriveFiles } from '../google-drive-files'

interface GoogleFileUploadButtonProps {
  libraryId: string
  disabled: boolean
}

export const GoogleFileUploadButton = ({ libraryId, disabled }: GoogleFileUploadButtonProps) => {
  const [googleDriveAccessToken, setGoogleDriveAccessToken] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()
  useEffect(() => {
    const googleDriveAccessTokenString = localStorage.getItem('google_drive_access_token')
    const updateAccessToken = () => {
      const updateToken = () => {
        setGoogleDriveAccessToken(googleDriveAccessTokenString ? JSON.parse(googleDriveAccessTokenString) : null)
      }
      updateToken()
    }
    updateAccessToken()
  }, [])
  useEffect(() => {
    if (googleDriveAccessToken) {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('googleDriveAuth')) {
        dialogRef.current?.showModal()
      }
    }
  }, [googleDriveAccessToken])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (googleDriveAccessToken) {
            dialogRef.current?.showModal()
          } else if (typeof window !== 'undefined') {
            window.location.href = `/libraries/auth-google?redirectAfterAuth=${encodeURIComponent(window.location.href)}&googleDriveAuth=true`
          }
        }}
      >
        <FolderIcon className="h-5 w-5" />
        {t('libraries.googleDrive')}
      </button>
      <PortalDialog
        ref={dialogRef}
        className="relative flex h-[80vh] w-[90vw] max-w-4xl flex-col"
        onClose={() => dialogRef.current?.close()}
      >
        <button
          type="button"
          className="btn btn-ghost btn-sm absolute right-2 top-2"
          onClick={() => dialogRef.current?.close()}
        >
          <CrossIcon />
        </button>
        <h3 className="text-lg font-bold">{t('texts.addGoogleDriveFiles')}</h3>
        <div className="grow overflow-auto">
          <GoogleDriveFiles libraryId={libraryId} disabled={disabled} dialogRef={dialogRef} />
        </div>
      </PortalDialog>
    </>
  )
}
