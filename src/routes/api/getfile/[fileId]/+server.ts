import { readFile } from 'node:fs/promises'
import type { RequestHandler } from '@sveltejs/kit'
import { sharedState } from '$lib/server/db/data'

export const GET: RequestHandler = async ({ params }) => {
  const fileId = params.fileId as string
  if (!fileId || !sharedState.uploadedFilesDB[fileId]) {
    return new Response('File not found', { status: 404 })
  }

  try {
    const { mimeType, filePath } = sharedState.uploadedFilesDB[fileId]
    return new Response(await readFile(filePath), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
      },
    })
  } catch (err) {
    return new Response('File not found', { status: 404 })
  }
}
