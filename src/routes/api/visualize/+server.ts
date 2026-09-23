import { json, type RequestHandler } from '@sveltejs/kit'
import * as v from 'valibot'
import { generateSentenceIllustration } from '$lib/server'

const requestSchema = v.object({
	sentence: v.string()
})

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json()
		const parsed = v.safeParse(requestSchema, body)
		if (!parsed.success) {
			return json({ error: 'Ungültiger Request-Body' }, { status: 400 })
		}

		const { sentence } = parsed.output
		const result = await generateSentenceIllustration(sentence)

		if (!result) {
			return json({ error: 'Bildgenerierung konnte nicht abgeschlossen werden' }, { status: 500 })
		}

		return json(result)
	} catch (error) {
		console.error('Visualization API Error:', error)
		return json({ error: 'Fehler bei der Bildgenerierung' }, { status: 500 })
	}
}
