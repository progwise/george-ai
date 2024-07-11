import { Links, Meta, Outlet, Scripts } from '@remix-run/react'

export default function App() {
  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <link href="./output.css" rel="stylesheet" />

        <Meta />
        <Links />
      </head>
      <body>
        <h1>Hell world!</h1>
        <Outlet />

        <Scripts />
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <button className="btn">Button</button>
      </body>
    </html>
  )
}
