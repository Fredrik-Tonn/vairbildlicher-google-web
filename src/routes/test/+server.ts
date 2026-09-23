import { json, type RequestHandler } from '@sveltejs/kit'
import { vairResponses } from '$lib/server/db/data'
import { dummyResponseWait } from '$lib'

export const POST: RequestHandler = async ({ request }) => {
	const { meta } = await request.json()
	await new Promise((resolve) => setTimeout(resolve, dummyResponseWait))

	const vairResponse = vairResponses[Math.floor(Math.random() * vairResponses.length)]
	vairResponse.meta.chatid = meta.chatid ?? crypto.randomUUID()

	return json(vairResponse, { status: 200 })
}
