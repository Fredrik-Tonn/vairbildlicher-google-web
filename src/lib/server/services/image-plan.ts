/**
 * Parsing of the JSON summary and assembly of the image prompt.
 * No SvelteKit imports, so scripts/image-eval.ts can run this with plain Node.
 */
import type { Genre, ImageContext, ImagePlan } from '../../shared/domain/verainfacher.model'

const GENRES: Genre[] = ['functional', 'narrative', 'educational', 'mixed']

// Input variants for the comparison in scripts/image-eval.ts
export type ImageVariant = 'sentence' | 'context'

export type ParsedSummary = {
	sentences: string[]
	plan: ImagePlan
}

export const splitSentences = (text: string): string[] =>
	text
		.split(/(?<=[.!?])\s+/)
		.map((sentence) => sentence.trim())
		.filter((sentence) => sentence.length > 0)

const asString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

/**
 * Reads the JSON answer of SummarySystemPrompt_v3.
 * Returns null if it is not usable, then the caller falls back to plain text.
 */
export const parseSummaryJson = (raw: string): ParsedSummary | null => {
	let data: Record<string, unknown>
	try {
		// Models sometimes wrap JSON in a code fence despite the instruction
		data = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ''))
	} catch {
		return null
	}

	const sentences = Array.isArray(data.sentences) ? data.sentences.map(asString).filter(Boolean) : []
	if (sentences.length === 0) return null

	const genre = GENRES.includes(data.genre as Genre) ? (data.genre as Genre) : 'mixed'
	const rawContext = (data.image_context ?? {}) as Record<string, unknown>
	const context: ImageContext = {
		setting: asString(rawContext.setting),
		characters: (Array.isArray(rawContext.characters) ? rawContext.characters : [])
			.map((c: Record<string, unknown>) => ({ id: asString(c?.id), look: asString(c?.look) }))
			.filter((c) => c.id && c.look)
	}
	const rawBriefs = Array.isArray(data.image_briefs) ? data.image_briefs.map(asString) : []
	// Missing briefs fall back to the sentence itself
	const briefs = sentences.map((sentence, i) => rawBriefs[i] || sentence)

	return { sentences, plan: { genre, context, briefs } }
}

/**
 * Keeps the general part of ImageSystemPrompt.txt plus the section for the genre.
 * Sections start with a line like "[genre:narrative]".
 */
export const selectImageRules = (rules: string, genre: Genre = 'mixed'): string => {
	const lines = rules.split(/\r?\n/).filter((line) => !line.startsWith('#'))
	const kept: string[] = []
	let section: string | null = null
	for (const line of lines) {
		const header = line.match(/^\[genre:(\w+)\]\s*$/)
		if (header) {
			section = header[1]
			continue
		}
		if (section === null || section === genre) kept.push(line)
	}
	return kept.join('\n').trim()
}

export type ImagePromptInput = {
	rules: string
	sentence: string
	variant: ImageVariant
	genre?: Genre
	brief?: string
	context?: ImageContext
}

export const buildImagePrompt = ({ rules, sentence, variant, genre, brief, context }: ImagePromptInput): string => {
	const parts = [selectImageRules(rules, genre)]

	if (variant === 'context' && context) {
		if (context.setting) parts.push(`SETTING\n${context.setting}`)
		if (context.characters.length > 0) {
			parts.push(`CHARACTERS\n${context.characters.map((c) => `- ${c.id}: ${c.look}`).join('\n')}`)
		}
	}

	// The German sentence is what the reader sees next to the image
	parts.push(`SENTENCE (German, do not write it into the image)\n"${sentence}"`)
	if (variant === 'context' && brief) parts.push(`SCENE TO DRAW\n${brief}`)

	return parts.join('\n\n')
}
