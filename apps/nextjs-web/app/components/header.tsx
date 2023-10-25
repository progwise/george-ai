'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent } from 'react'

export const Header = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()
  const ischecked = searchParameters.get('theme') === 'dark' ? true : false
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedParameter = new URLSearchParams(searchParameters.toString())
    if (event.target.checked) {
      console.log('checked:', event.target.checked)
      updatedParameter.set('theme', 'dark')
      router.replace(pathname + '?' + updatedParameter.toString(), {
        scroll: false,
      })
    } else {
      console.log('checked:', event.target.checked)
      // updatedParameter.delete('theme')
      updatedParameter.set('theme', '')
      router.replace(pathname + '?' + updatedParameter.toString(), {
        scroll: false,
      })
    }
  }

  return (
    <header className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <svg
          fill="currentColor"
          width="100"
          height="100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M32.9632 1.43247C19.3052 5.19647 14.9172 11.2335 14.2782 27.1395L13.8832 36.9715H8.57124C-3.43376 36.9715 -2.71476 45.8845 10.0162 54.8675C12.4362 56.5745 14.7712 57.9715 15.2062 57.9715C15.6402 57.9715 16.1352 56.2845 16.3062 54.2215C16.5752 50.9705 17.1482 50.2055 20.6162 48.4715C24.2832 46.6375 26.4822 46.4815 47.0312 46.5865C72.0002 46.7145 72.1162 46.7475 72.1162 53.6625C72.1162 55.4825 72.4272 56.9715 72.8082 56.9715C74.6342 56.9715 87.2162 48.6405 89.5132 45.9115C94.6002 39.8655 92.2912 36.6115 83.2822 37.1305L77.3712 37.4715L76.8682 26.8115C76.2562 13.8505 74.0512 8.85347 67.2992 5.12947C58.2592 0.142474 43.4352 -1.45353 32.9632 1.43247ZM22.5712 51.4265C20.1892 53.8075 20.1162 54.3165 20.1162 68.4265C20.1162 77.4565 20.4952 82.9715 21.1162 82.9715C21.7202 82.9715 22.1162 78.7695 22.1162 72.3645C22.1162 62.6545 22.2642 61.8185 23.8662 62.4775C27.4202 63.9415 29.1442 64.1815 31.6252 63.5585C37.8612 61.9935 40.1402 55.2215 35.8022 51.1455C32.4632 48.0095 25.8472 48.1495 22.5712 51.4265ZM33.5112 52.2705C36.1852 54.2265 35.2712 59.0435 31.8662 60.9395C29.3962 62.3155 28.8362 62.3155 26.3662 60.9395C23.1132 59.1285 22.2512 54.9785 24.6332 52.5975C26.5872 50.6425 31.0592 50.4785 33.5112 52.2705ZM33.6602 74.5735C30.2292 76.1665 28.3312 76.5655 27.4942 75.8705C25.7932 74.4585 24.8002 78.0085 26.0062 81.1835C27.9322 86.2485 38.2642 87.4215 44.0202 83.2295C46.5882 81.3585 46.6522 81.3635 50.0142 83.6545C56.0292 87.7555 64.9052 86.3095 67.1622 80.8595C68.5962 77.3995 67.7382 74.2105 65.8052 75.8145C64.8662 76.5945 63.1632 76.2545 59.5022 74.5585C52.4692 71.3005 40.6972 71.3075 33.6602 74.5735Z" />
        </svg>
        <div className="flex flex-col">
          <h1 className="font-bold text-xl ">George AI</h1>
          <span>Liest und analysiert das Intranet - zu Ihren Diensten...</span>
        </div>
      </div>
      <label className="swap swap-rotate">
        <input
          type="checkbox"
          // checked={ischecked}
          onChange={handleInputChange}
        />
        <svg
          className="swap-on fill-current w-10 h-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
        </svg>
        <svg
          className="swap-off fill-current w-10 h-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
        </svg>
      </label>
    </header>
  )
}
