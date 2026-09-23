import { json, type RequestHandler } from '@sveltejs/kit'
import * as v from 'valibot'
import { getChatCompletion } from '$lib/server'

const requestSchema = v.object({
	prompt: v.optional(v.string(), ''),
	images: v.optional(v.array(v.string()), []),
	chatId: v.optional(v.string(), '')
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json()
		const parsed = v.safeParse(requestSchema, body)
		if (!parsed.success) {
			return json({ error: 'Invalid request body' }, { status: 400 })
		}

		const result = await getChatCompletion({
			prompt: parsed.output.prompt || '',
			images: parsed.output.images || [],
			chatId: parsed.output.chatId || ''
		})

		return json(result)
	} catch (error) {
		console.error('Chat API Error:', error)
		return json({ error: 'Failed to generate completion' }, { status: 500 })
	}
}
