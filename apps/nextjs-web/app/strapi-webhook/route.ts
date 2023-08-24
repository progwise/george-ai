import { NextResponse } from 'next/server'
import { rebuildTypesenseCollection } from '@george-ai/typesense-cli'

export const POST = async (request: Request) => {
  await rebuildTypesenseCollection()
  return NextResponse.json({ ok: true })
}
