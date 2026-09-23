import { json, type RequestHandler } from '@sveltejs/kit'
import * as v from 'valibot'
import { textToSpeech } from '$lib/server'

const requestSchema = v.object({
	text: v.string()
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json()
		const parsed = v.safeParse(requestSchema, body)
		if (!parsed.success) {
			return json({ error: 'Invalid request body' }, { status: 400 })
		}

		const { text } = parsed.output
		const result = await textToSpeech(text)

		return json(result)
	} catch (error) {
		console.error('TTS API Error:', error)
		return json({ error: 'Failed to generate TTS' }, { status: 500 })
	}
}
