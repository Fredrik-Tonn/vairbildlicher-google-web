import { env } from '$env/dynamic/private'

export interface TTSResult {
	audio: string
	mimeType: string
	message: string
}

/**
 * Generates spoken audio using Google Cloud Text-to-Speech
 * Uses German Neural2 voice (de-DE-Neural2-B or de-DE-Journey-F) for high naturalness in Easy Language.
 */
export const textToSpeech = async (text: string): Promise<TTSResult> => {
	const apiKey = env.GOOGLE_TTS_API_KEY || env.GEMINI_API_KEY

	if (!apiKey) {
		console.warn('Neither GOOGLE_TTS_API_KEY nor GEMINI_API_KEY is configured in .env')
		throw new Error('Google TTS API-Schlüssel fehlt. Bitte trage GEMINI_API_KEY oder GOOGLE_TTS_API_KEY in der .env ein.')
	}

	try {
		const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				input: {
					text
				},
				voice: {
					languageCode: 'de-DE',
					name: 'de-DE-Neural2-B' // High-quality natural neural German voice
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
		const audioBase64 = data.audioContent

		if (!audioBase64) {
			throw new Error('Keine Audiodaten von Google TTS empfangen')
		}

		return {
			audio: audioBase64,
			mimeType: 'audio/mpeg',
			message: 'Audio erfolgreich mit Google TTS generiert'
		}
	} catch (error) {
		console.error('TTS execution failed:', error)
		throw error
	}
}
