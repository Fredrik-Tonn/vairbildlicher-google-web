import { json, type RequestHandler } from '@sveltejs/kit'
import * as v from 'valibot'
import { generateMultipleChoiceChallenge } from '$lib/server'

const requestSchema = v.object({
	chatId: v.string()
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json()
		const parsed = v.safeParse(requestSchema, body)
		if (!parsed.success) {
			return json({ error: 'Invalid request body' }, { status: 400 })
		}

		const { chatId } = parsed.output
		const result = await generateMultipleChoiceChallenge(chatId)

		// json(undefined) sends an empty body, which breaks response.json() on the client
		return json(result ?? null)
	} catch (error) {
		console.error('Multiple Choice Challenge API Error:', error)
		return json({ error: 'Failed to generate multiple choice challenge' }, { status: 500 })
	}
}
