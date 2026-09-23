import { GoogleGenAI } from '@google/genai'
import { env } from '$env/dynamic/private'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { getRedisClient } from './redis.adapter'
import type { Challenge } from '$lib/shared/domain/verainfacher.model'

// Target models per Google Gemini Guidelines
const MODEL_TEXT = 'gemini-3.8-flash'
const MODEL_IMAGE = 'gemini-3.1-flash-image'

// Prompts are cached briefly so edits to the .txt files take effect without a restart
const PROMPT_CACHE_TTL_SECONDS = 300
const MAX_DIFFICULT_WORDS = 5

let aiClient: GoogleGenAI | null = null

export function getAiClient(): GoogleGenAI {
	const apiKey = env.GEMINI_API_KEY
	if (!apiKey) {
		throw new Error(
			'GEMINI_API_KEY ist nicht in der .env konfiguriert. Bitte trage deinen Google Gemini API-Schlüssel ein.'
		)
	}

	if (!aiClient) {
		aiClient = new GoogleGenAI({ apiKey })
	}
	return aiClient
}

const getHistoryKey = (chatId: string) => `vair:chat_history:${chatId}`

export const loadSystemPrompts = async () => {
	const redis = await getRedisClient()

	const promptNames = [
		'AnswerSystemPrompt_v2',
		'SummarySystemPrompt_v2',
		'DifficultWordsSystemPrompt',
		'FollowUpQuestionsSystemPrompt',
		'ChallengeSystemPrompt'
	]

	const prompts: Record<string, string> = {}
	await Promise.all(
		promptNames.map(async (name) => {
			const redisKey = `vair:prompts:${name}`
			let content = await redis.get(redisKey)

			if (!content) {
				try {
					const filePath = join(env.PROMPTS_DIR || 'local-files/system-prompts', `${name}.txt`)
					content = await readFile(filePath, 'utf-8')
					if (content) {
						await redis.set(redisKey, content, { EX: PROMPT_CACHE_TTL_SECONDS })
					}
				} catch (e) {
					console.error(`Failed to load prompt ${name} from file`, e)
					content = ''
				}
			}
			prompts[name] = content || ''
		})
	)

	return prompts
}

export const loadHistory = async (chatId: string): Promise<Array<{ role: string; content: string }>> => {
	const redis = await getRedisClient()
	const historyData = await redis.get(getHistoryKey(chatId))
	return historyData ? JSON.parse(historyData) : []
}

function parseBase64Image(dataUrl: string): { mimeType: string; base64: string } {
	if (dataUrl.startsWith('data:')) {
		const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
		if (matches) {
			return { mimeType: matches[1], base64: matches[2] }
		}
	}
	return { mimeType: 'image/jpeg', base64: dataUrl }
}

export type ChatRequest = {
	prompt: string
	images: string[]
	chatId: string
}

/**
 * Main chat completion using Google Gemini 3.8 Flash
 * Multimodal: Processes images and document photos directly without separate OCR!
 */
export const getChatCompletion = async ({ prompt, images, chatId }: ChatRequest) => {
	const userPrompt = prompt || ''
	chatId = chatId || crypto.randomUUID()
	console.log(`[Google Gemini] Chat request received for chatId: ${chatId}`)

	const ai = getAiClient()
	const prompts = await loadSystemPrompts()
	const history = await loadHistory(chatId)

	let systemInstruction = ''
	const inputs: Array<{ type: 'text' | 'image' | 'document'; text?: string; data?: string; mime_type?: string }> = []

	if (images && images.length > 0) {
		systemInstruction = prompts['SummarySystemPrompt_v2']

		// Add photos and PDFs directly into the multimodal input (PDFs as 'document')
		for (const img of images) {
			const { mimeType, base64 } = parseBase64Image(img)
			inputs.push({
				type: mimeType === 'application/pdf' ? 'document' : 'image',
				data: base64,
				mime_type: mimeType
			})
		}

		inputs.push({
			type: 'text',
			text: userPrompt
				? `Lies den Text auf diesen Bildern oder Dokumenten und beantworte Folgendes in Leichter Sprache: ${userPrompt}`
				: 'Lies den Text auf diesen Bildern oder Dokumenten und fasse ihn exakt nach den Regeln für Leichte Sprache zusammen.'
		})
	} else {
		systemInstruction = prompts['AnswerSystemPrompt_v2']

		// Include recent history for multi-turn conversation
		const historyContext = history.length > 0
			? 'Bisheriger Gesprächsverlauf:\n' + history.map(h => `${h.role === 'user' ? 'Nutzer' : 'Assistent'}: ${h.content}`).join('\n') + '\n\n'
			: ''

		inputs.push({
			type: 'text',
			text: `${historyContext}Nutzer-Anfrage: ${userPrompt}`
		})
	}

	const interaction = await ai.interactions.create({
		model: MODEL_TEXT,
		system_instruction: systemInstruction,
		input: inputs as any
	})

	const completion = (interaction.output_text || '').trim()

	// Update history
	history.push({ role: 'user', content: userPrompt || '[Dokument/Bilder hochgeladen]' })
	history.push({ role: 'assistant', content: completion })
	const trimmedHistory = history.length > 30 ? history.slice(history.length - 30) : history

	const redis = await getRedisClient()
	await redis.set(getHistoryKey(chatId), JSON.stringify(trimmedHistory), { EX: 1800 })

	// Split completion into clean sentences
	const completion_items = completion
		.split(/(?<=[.!?])\s+/)
		.map((sentence: string) => sentence.trim())
		.filter((sentence: string) => sentence.length > 0)

	return {
		result: {
			completion,
			completion_items
		},
		meta: {
			chatId
		}
	}
}

/**
 * Generate 3 follow-up questions in Easy Language using Gemini
 */
export const generateFollowupQuestions = async (completion: string): Promise<string[]> => {
	try {
		const ai = getAiClient()
		const prompts = await loadSystemPrompts()

		const interaction = await ai.interactions.create({
			model: MODEL_TEXT,
			system_instruction: prompts['FollowUpQuestionsSystemPrompt'],
			input: `${completion}\n\nErstelle 3 kurze Folgefragen in Leichter Sprache als einfache Liste.`
		})

		const text = interaction.output_text || ''
		return text
			.split('\n')
			.map(line => line.replace(/^[-*•\d.)\s]+/, '').trim())
			.filter(line => line.length > 0 && line.endsWith('?'))
			.slice(0, 3)
	} catch (e) {
		console.error('[Gemini] Error generating follow-up questions:', e)
		return []
	}
}

/**
 * Extract difficult words from text using Gemini
 */
export const extractDifficultWords = async (completion: string): Promise<string[]> => {
	try {
		const ai = getAiClient()
		const prompts = await loadSystemPrompts()

		const interaction = await ai.interactions.create({
			model: MODEL_TEXT,
			system_instruction: prompts['DifficultWordsSystemPrompt'],
			input: `${completion}\n\nListe der schwierigen Worte (kommagetrennt):`
		})

		const text = interaction.output_text || ''
		const lowerCompletion = completion.toLowerCase()
		return text
			.split(/[,;\n]+/)
			.map(w => w.replace(/^[-*•\s]+/, '').replace(/[."'„“]+$/, '').trim())
			.filter(w => w.length > 1 && !/^keine\b/i.test(w))
			// Grounding: words come back in their base form, so only the stem must appear in the text
			.filter(w => lowerCompletion.includes(w.toLowerCase().slice(0, 5)))
			.slice(0, MAX_DIFFICULT_WORDS)
	} catch (e) {
		console.error('[Gemini] Error extracting difficult words:', e)
		return []
	}
}

/**
 * Generate multiple choice understanding challenge with structured JSON output
 */
export const generateMultipleChoiceChallenge = async (
	chatId: string
): Promise<Challenge | undefined> => {
	try {
		const ai = getAiClient()
		const prompts = await loadSystemPrompts()
		const history = await loadHistory(chatId)

		const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n')

		const prompt = `${prompts['ChallengeSystemPrompt']}

Bisheriger Kontext:
${historyText}

Erstelle jetzt das Multiple-Choice Quiz als JSON.`

		const interaction = await ai.interactions.create({
			model: MODEL_TEXT,
			input: prompt,
			response_format: {
				type: 'json_object'
			} as any
		})

		const rawOutput = interaction.output_text || '{}'
		const parsed = JSON.parse(rawOutput)
		return parsed.challenge || parsed
	} catch (e) {
		console.error('[Gemini] Error generating challenge:', e)
		return undefined
	}
}

/**
 * Generate visual illustration ("Verbildlicher") for a sentence or concept
 * Uses Google Gemini Image Generation / Imagen 3
 */
export const generateSentenceIllustration = async (sentence: string): Promise<{ imageUrl: string } | null> => {
	try {
		const ai = getAiClient()
		const prompt = `A clear, simple, friendly and colorful vector illustration depicting: "${sentence}". Suitable for educational material and easy language comprehension. Clean white background, no text inside the image, welcoming flat art style.`

		const interaction = await ai.interactions.create({
			model: MODEL_IMAGE,
			response_modalities: ['image'],
			input: prompt
		})

		for (const step of interaction.steps || []) {
			if (step.type === 'model_output') {
				for (const item of (step as any).content || []) {
					if (item.type === 'image' && item.data) {
						const mime = item.mime_type || 'image/png'
						return {
							imageUrl: `data:${mime};base64,${item.data}`
						}
					}
				}
			}
		}

		return null
	} catch (e) {
		console.error('[Gemini] Error generating illustration:', e)
		return null
	}
}
