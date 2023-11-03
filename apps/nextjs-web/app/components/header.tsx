'use client'

import { SunSvg } from '@/public/sun-svg'
import { PopeBowlerHatSvg } from '@/public/pope-bowler-hat-svg'
import { MoonSvg } from '@/public/moon-svg'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent } from 'react'

export const Header = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()
  const ischecked = searchParameters.get('theme') === 'dark' ? true : false
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const theme = event.target.checked ? 'dark' : 'light'
    const updatedParameter = new URLSearchParams(searchParameters.toString())
    updatedParameter.set('theme', theme)
    router.replace(pathname + '?' + updatedParameter.toString(), {
      scroll: false,
    })
  }

  return (
    <header className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <PopeBowlerHatSvg />
        <div className="flex flex-col">
          <h1 className="font-bold text-xl">George AI</h1>
          <span>Liest und analysiert das Intranet - zu Ihren Diensten...</span>
        </div>
      </div>
      <label className="swap swap-rotate">
        <input
          type="checkbox"
          checked={ischecked}
          onChange={handleInputChange}
        />
        <MoonSvg />
        <SunSvg />
      </label>
    </header>
  )
}
