import { useEffect, useRef, useState } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { CrossIcon } from '../../../icons/cross-icon'
import { GoogleDriveFiles } from '../google-drive-files'

interface GoogleFileUploadButtonProps {
  libraryId: string
  disabled: boolean
  tableDataChanged: () => void
}

export const GoogleFileUploadButton = ({ libraryId, disabled, tableDataChanged }: GoogleFileUploadButtonProps) => {
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
        className="btn btn-xs tooltip tooltip-bottom"
        data-tip={t('tooltips.addGoogleDriveFiles')}
        onClick={() => {
          if (googleDriveAccessToken) {
            dialogRef.current?.showModal()
          } else if (typeof window !== 'undefined') {
            window.location.href = `/libraries/auth-google?redirectAfterAuth=${encodeURIComponent(window.location.href)}&googleDriveAuth=true`
          }
        }}
      >
        <span className="hidden sm:inline">{t('libraries.googleDrive')}</span>
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box relative flex w-full min-w-[400px] max-w-screen-lg flex-col">
          <button
            type="button"
            className="btn btn-ghost btn-sm absolute right-2 top-2"
            onClick={() => dialogRef.current?.close()}
          >
            <CrossIcon />
          </button>
          <h3 className="text-lg font-bold">{t('texts.addGoogleDriveFiles')}</h3>
          <div className="flex-grow overflow-auto">
            <GoogleDriveFiles
              libraryId={libraryId}
              disabled={disabled}
              dialogRef={dialogRef}
              tableDataChanged={tableDataChanged}
            />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => dialogRef.current?.close()}>
          <button type="button" onClick={() => dialogRef.current?.close()}>
            Close
          </button>
        </form>
      </dialog>
    </>
  )
}
