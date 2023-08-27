import { NextResponse } from 'next/server'
import { updateTypesenseDocument } from '@george-ai/typesense-cli'

export const POST = async (request: Request) => {
  const data = await request.json()
  await updateTypesenseDocument(data.entry)
  return NextResponse.json({ ok: true })
}
