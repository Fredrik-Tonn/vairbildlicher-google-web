import { env } from '$env/dynamic/private'
import { getAiClient } from './gemini.service'

export interface TTSResult {
	audio: string
	mimeType: string
	message: string
}

const MODEL_TTS = 'gemini-3.8-flash-tts'
const GEMINI_TTS_VOICE = 'Kore'

/**
 * Generates spoken audio.
 * Default: Gemini TTS (works with GEMINI_API_KEY alone).
 * If GOOGLE_TTS_API_KEY is set, Google Cloud Text-to-Speech is used instead.
 */
export const textToSpeech = async (text: string): Promise<TTSResult> => {
	return env.GOOGLE_TTS_API_KEY ? cloudTextToSpeech(text, env.GOOGLE_TTS_API_KEY) : geminiTextToSpeech(text)
}

const geminiTextToSpeech = async (text: string): Promise<TTSResult> => {
	const ai = getAiClient()

	const interaction = await ai.interactions.create({
		model: MODEL_TTS,
		response_modalities: ['audio'],
		generation_config: {
			speech_config: [{ voice: GEMINI_TTS_VOICE, language: 'de-DE' }]
		},
		// Plain text only: style instructions like "Lies langsam vor:" get read aloud by this model
		input: text
	})

	for (const step of interaction.steps || []) {
		if (step.type === 'model_output') {
			for (const item of (step as any).content || []) {
				if (item.type === 'audio' && item.data) {
					return {
						audio: item.data,
						mimeType: item.mime_type || 'audio/wav',
						message: 'Audio erfolgreich mit Gemini TTS generiert'
					}
				}
			}
		}
	}

	throw new Error('Keine Audiodaten von Gemini TTS empfangen')
}

/**
 * Google Cloud Text-to-Speech with German Neural2 voice
 */
const cloudTextToSpeech = async (text: string, apiKey: string): Promise<TTSResult> => {
	const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Api-Key': apiKey
		},
		body: JSON.stringify({
			input: {
				text
			},
			voice: {
				languageCode: 'de-DE',
				name: 'de-DE-Neural2-B'
			},
			audioConfig: {
				audioEncoding: 'MP3',
				speakingRate: 0.92, // Slightly slower for better comprehension in Leichte Sprache
				pitch: 0.0
			}
		})
	})

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}))
		const errMsg = errData.error?.message || response.statusText
		console.error('Google Cloud TTS Error:', errMsg)
		throw new Error(`Google Cloud TTS fehlgeschlagen: ${errMsg}`)
	}

	const data = await response.json()
	if (!data.audioContent) {
		throw new Error('Keine Audiodaten von Google TTS empfangen')
	}

	return {
		audio: data.audioContent,
		mimeType: 'audio/mpeg',
		message: 'Audio erfolgreich mit Google Cloud TTS generiert'
	}
}
