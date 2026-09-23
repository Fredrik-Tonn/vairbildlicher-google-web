import { json, type RequestHandler } from '@sveltejs/kit'
import * as v from 'valibot'
import { extractDifficultWords } from '$lib/server'

const requestSchema = v.object({
	completion: v.string()
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json()
		const parsed = v.safeParse(requestSchema, body)
		if (!parsed.success) {
			return json({ error: 'Invalid request body' }, { status: 400 })
		}

		const { completion } = parsed.output
		const result = await extractDifficultWords(completion)

		return json(result)
	} catch (error) {
		console.error('Difficult Words API Error:', error)
		return json({ error: 'Failed to generate difficult words' }, { status: 500 })
	}
}
