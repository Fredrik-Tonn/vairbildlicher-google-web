import { json, type RequestHandler } from '@sveltejs/kit'
import * as v from 'valibot'
import { generateFollowupQuestions } from '$lib/server'

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
		const result = await generateFollowupQuestions(completion)

		return json(result)
	} catch (error) {
		console.error('Followup Questions API Error:', error)
		return json({ error: 'Failed to generate followup questions' }, { status: 500 })
	}
}
