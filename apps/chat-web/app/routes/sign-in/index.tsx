import { createFileRoute } from '@tanstack/react-router'
import EmailIcon from '../../components/icons/email-icon'
import KeyIcon from '../../components/icons/key-icon'
import { useAuth } from '../../auth'
import { useEffect } from 'react'

export const Route = createFileRoute('/sign-in/')({
  component: RouteComponent,
})

function RouteComponent() {
  const context = useAuth()
  useEffect(() => {
    context?.login()
  }, [context])
  return (
    <div className="container mx-auto my-auto h-full flex justify-center items-center mt-10">
      <form className="flex flex-col gap-4 w-96">
        <label className="input input-bordered flex items-center gap-2 w-full">
          <EmailIcon className="h-4 w-4 opacity-70" />
          <input className="grow" type="email" placeholder="Email" />
        </label>
        <label className="input input-bordered flex items-center gap-2 w-full">
          <KeyIcon className="h-4 w-4 opacity-70" />
          <input type="password" className="grow" placeholder="Password" />
        </label>
        <button className="btn" type="submit">
          Sign in
        </button>
      </form>
    </div>
  )
}
