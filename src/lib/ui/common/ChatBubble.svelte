<script lang="ts">
	import { chatbotName, ChatBubbleBottomCenterTextMicro, ClickableSentences, ParagraphPlaceholder, UserMicro, SpeakerSolid, PhotoSolid, AudioPlayer } from '$lib'
	import { isPdfDataUrl } from '$lib/shared/helper'
	import { tick } from 'svelte'
	import { marked } from 'marked'
	import { audioCache } from '$lib/shared/audioCache'
	import { GENRE_LABELS, type ImagePlan } from '$lib/shared/domain/verainfacher.model'
	import type { SentenceImage } from './ClickableSentences.svelte'

	let { message, isLast, showPlaceholder, onSentenceSelect }: { message: any, isLast: boolean, showPlaceholder: boolean, onSentenceSelect?: (sentence: string) => void } = $props()

	let div: HTMLDivElement | undefined = $state()
	
	// TTS state management
	let ttsState: 'idle' | 'loading' | 'error' = $state('idle')
	let cachedAudioBlob: Blob | null = $state(null)

	// Image Visualization ("Verbildlicher") state management
	let imageState: 'idle' | 'loading' | 'success' | 'error' = $state('idle')
	let generatedImageUrl: string | null = $state(null)

	let alignRight = $derived((message.user === chatbotName) ? '' : 'justify-end')
	let cornerRnd = $derived((message.user === chatbotName) ? 'rounded-e-xl rounded-es-xl' : 'rounded-s-xl rounded-ee-xl')
	let bgColor = $derived((message.user === chatbotName) ? 'border-gray-200 bg-gray-100 dark:bg-gray-700' : 'border-stone-400 bg-stone-300 dark:bg-stone-900')
	let messageTimeFormatted = $derived(message.timestamp === 0
		? '' : new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
	let messageText = $derived(message.completion ?? message.prompt)
	let messageTextFormatted = $derived(marked.parse(messageText.replaceAll('\n', '<br>')))
	let hasCompletionItems = $derived(message.user === chatbotName && message.completion_items && message.completion_items.length > 0)
	let showTTSButton = $derived(message.user === chatbotName && !showPlaceholder && messageText.trim().length > 0 && !cachedAudioBlob)
	let showAudioPlayer = $derived(message.user === chatbotName && !showPlaceholder && cachedAudioBlob)
	let imagePlan: ImagePlan | undefined = $derived(message.image_plan)
	let showVisualizeButton = $derived(message.user === chatbotName && !showPlaceholder && messageText.trim().length > 0 && !generatedImageUrl && !imagePlan)

	// One image per sentence, started automatically when the answer has an image plan
	let sentenceImages: SentenceImage[] = $state([])
	let imagesStartedFor = 0

	const loadSentenceImage = async (idx: number, sentence: string, plan: ImagePlan) => {
		const startedAt = performance.now()
		try {
			const response = await fetch('/api/visualize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sentence,
					variant: 'context',
					genre: plan.genre,
					brief: plan.briefs[idx],
					context: plan.context
				})
			})
			const result = await response.json()
			if (!response.ok || !result.imageUrl) throw new Error(result.error || 'Kein Bild')
			sentenceImages[idx] = { state: 'success', url: result.imageUrl }
			console.log(`[Verbildlicher] Bild ${idx + 1}: ${Math.round(performance.now() - startedAt)} ms bis im Browser`)
		} catch (error) {
			console.error(`[Verbildlicher] Bild ${idx + 1} fehlgeschlagen:`, error)
			sentenceImages[idx] = { state: 'error' }
		}
	}

	$effect(() => {
		const plan = imagePlan
		const items: string[] = message.completion_items ?? []
		if (!plan || showPlaceholder || items.length === 0 || imagesStartedFor === message.timestamp) return
		imagesStartedFor = message.timestamp
		sentenceImages = items.map(() => ({ state: 'loading' }))
		// Parallel, so the wait is one image generation, not three
		items.forEach((item, idx) => loadSentenceImage(idx, stripHtml(marked.parse(item) as string), plan))
	})

	// Extract HTML tags from parsed markdown
	const stripHtml = (html: string): string => {
		const temp = document.createElement('div')
		temp.innerHTML = html
		return temp.textContent || temp.innerText || ''
	}

	// Get clean text for TTS / Image Prompt from completion_items or fallback to message text
	const getTextForTTS = (msg: any): string => {
		if (msg.completion_items && msg.completion_items.length > 0) {
			return msg.completion_items
				.map((item: string) => {
					const html = marked.parse(item) as string
					return stripHtml(html)
				})
				.join(' ')
				.replace(/\s+/g, ' ')
				.trim()
		}
		
		const text = msg.completion || msg.prompt || ''
		return text
			.replace(/\*\*(.*?)\*\*/g, '$1')
			.replace(/\*(.*?)\*/g, '$1')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.replace(/`([^`]+)`/g, '$1')
			.replace(/#{1,6}\s+/g, '')
			.replace(/\s+/g, ' ')
			.trim()
	}

	// Check cache on component mount
	$effect(() => {
		if (message.user === chatbotName && !showPlaceholder && messageText.trim().length > 0) {
			const plainText = getTextForTTS(message)
			const cached = audioCache.get(plainText)
			if (cached) {
				cachedAudioBlob = cached.audioBlob
			}
		}
	})

	// Google TTS functionality
	const handleTTSClick = async () => {
		if (ttsState === 'loading') return

		try {
			ttsState = 'loading'
			const plainText = getTextForTTS(message)

			const response = await fetch('/api/tts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text: plainText })
			})

			const result = await response.json()

			if (!response.ok || result.error) {
				throw new Error(result.error || 'Failed to generate audio')
			}

			const audioBlob = new Blob(
				[Uint8Array.from(atob(result.audio), c => c.charCodeAt(0))],
				{ type: result.mimeType }
			)

			audioCache.set(plainText, audioBlob, result.mimeType)
			cachedAudioBlob = audioBlob
			ttsState = 'idle'
		} catch (error) {
			console.error('Google TTS Error:', error)
			ttsState = 'error'
			setTimeout(() => { ttsState = 'idle' }, 3000)
		}
	}

	// Google Imagen / Gemini Image Generation ("Verbildlicher")
	const handleVisualizeClick = async () => {
		if (imageState === 'loading') return

		try {
			imageState = 'loading'
			const plainText = getTextForTTS(message)

			const response = await fetch('/api/visualize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ sentence: plainText })
			})

			const result = await response.json()

			if (!response.ok || result.error || !result.imageUrl) {
				throw new Error(result.error || 'Fehler beim Erstellen des Bildes')
			}

			generatedImageUrl = result.imageUrl
			imageState = 'success'
		} catch (error) {
			console.error('Visualization Error:', error)
			imageState = 'error'
			setTimeout(() => { imageState = 'idle' }, 3000)
		}
	}

	$effect.pre(() => {
		tick().then(() => {
			if (div) {
				div.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
			}
		})
	})
</script>

<div class="flex items-start gap-2.5 mt-5 {alignRight}">
	{#if message.user === chatbotName}
		<ChatBubbleBottomCenterTextMicro></ChatBubbleBottomCenterTextMicro>
	{/if}
	<div class="flex flex-col gap-1 w-full max-w-full sm:max-w-xl lg:max-w-2xl">
		<div class="flex items-center space-x-2 rtl:space-x-reverse {alignRight}">
			<span class="text-xs font-semibold text-gray-900">{message.user}</span>
			<span class="text-xs font-normal text-gray-900">{messageTimeFormatted}</span>
			{#if imagePlan}
				<span class="text-xs font-medium text-gray-900 rounded-full border border-gray-400 px-2 py-0.5">{GENRE_LABELS[imagePlan.genre]}</span>
			{/if}
			
			<!-- Google TTS Button -->
			{#if showTTSButton}
				<button
					class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 {ttsState === 'loading' ? 'animate-pulse' : ''} {ttsState === 'error' ? 'text-red-500 hover:bg-red-50' : 'text-blue-600 dark:text-blue-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
					onclick={handleTTSClick}
					disabled={ttsState === 'loading'}
					aria-label={ttsState === 'idle' ? 'Text vorlesen lassen (Google TTS)' : ttsState === 'loading' ? 'Audio wird generiert...' : 'Fehler beim Vorlesen'}
					title={ttsState === 'idle' ? 'Text vorlesen lassen (Google TTS)' : ttsState === 'loading' ? 'Audio wird generiert...' : 'Fehler beim Vorlesen'}
				>
					{#if ttsState === 'loading'}
						<div class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
					{:else}
						<SpeakerSolid class="w-4 h-4" />
					{/if}
				</button>
			{/if}

			<!-- Google Imagen / Gemini "Verbildlichen" Button -->
			{#if showVisualizeButton}
				<button
					class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 {imageState === 'loading' ? 'animate-pulse' : ''} {imageState === 'error' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 dark:text-emerald-400'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
					onclick={handleVisualizeClick}
					disabled={imageState === 'loading'}
					aria-label={imageState === 'idle' ? 'Text als Bild verbildlichen' : imageState === 'loading' ? 'Bild wird gezeichnet...' : 'Fehler beim Verbildlichen'}
					title={imageState === 'idle' ? 'Text als Bild verbildlichen' : imageState === 'loading' ? 'Bild wird gezeichnet...' : 'Fehler beim Verbildlichen'}
				>
					{#if imageState === 'loading'}
						<div class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
					{:else}
						<PhotoSolid class="w-4 h-4" />
					{/if}
				</button>
			{/if}
		</div>
		
		<!-- Audio Player -->
		{#if showAudioPlayer && cachedAudioBlob}
			<AudioPlayer audioBlob={cachedAudioBlob} autoPlay={true} />
		{/if}

		<!-- Verbildlicher: Generated Illustration Card -->
		{#if generatedImageUrl}
			<div class="mb-2 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm transition-all duration-300">
				<div class="px-3 py-1.5 bg-emerald-100/70 border-b border-emerald-200 flex items-center justify-between text-xs font-medium text-emerald-800">
					<span class="flex items-center gap-1">
						<PhotoSolid class="w-3.5 h-3.5 text-emerald-600" />
						Verbildlichung (Google AI)
					</span>
					<button 
						onclick={() => generatedImageUrl = null} 
						class="text-emerald-600 hover:text-emerald-900 text-xs px-1"
						title="Bild schließen"
					>
						✕
					</button>
				</div>
				<img 
					src={generatedImageUrl} 
					alt="Verbildlichte Darstellung des Textes" 
					class="w-full h-auto max-h-64 object-contain rounded-b-xl"
					loading="lazy"
				/>
			</div>
		{/if}
		
		<div class="flex flex-col leading-1.5 p-4 shadow-md selectable-text {bgColor} {cornerRnd}">
			{#if showPlaceholder}
				<ParagraphPlaceholder></ParagraphPlaceholder>
			{:else}
				{#if message.images?.length > 0}
					<div class="flex -space-x-2">
						{#each message.images as image, idx}
							{#if isPdfDataUrl(image)}
								<span class="inline-flex size-10 items-center justify-center rounded-full bg-white text-gray-800 ring-2 ring-white" role="img" aria-label="Hochgeladene PDF-Datei {idx + 1} von {message.images.length}">
									<span class="material-symbols-rounded text-[22px]" aria-hidden="true">picture_as_pdf</span>
								</span>
							{:else}
								<img class="inline-block size-10 rounded-full ring-2 ring-white" src={image} alt="Hochgeladenes Bild {idx + 1} von {message.images.length}">
							{/if}
						{/each}
					</div>
				{/if}
				{#if hasCompletionItems && onSentenceSelect}
					<div class="{message.images?.length > 0 ? 'mt-3' : ''}">
						<ClickableSentences 
							completionItems={message.completion_items}
							images={imagePlan ? sentenceImages : undefined}
							onSentenceSelect={onSentenceSelect}
						/>
					</div>
				{:else if hasCompletionItems}
					{#each message.completion_items as item, index}
						<p class="text-sm font-normal text-gray-700 dark:text-white {message.images?.length > 0 && index === 0 ? 'mt-3' : ''} {index > 0 ? 'mt-3' : ''}">
							{@html marked.parse(item.replaceAll('\n', '<br>'))}
						</p>
					{/each}
				{:else if messageTextFormatted}
					<p class="text-sm font-normal text-gray-700 dark:text-white {message.images?.length > 0 ? 'mt-3' : ''}">
						{@html messageTextFormatted}
					</p>
				{/if}
			{/if}
		</div>
	</div>
	{#if message.user !== chatbotName}
		<UserMicro></UserMicro>
	{/if}
</div>
