<script lang="ts" module>
	export type SentenceImage = { state: 'loading' | 'success' | 'error'; url?: string }
</script>

<script lang="ts">
	/**
	 * ClickableSentences component
	 * Makes each sentence (completion_item) clickable for follow-up questions
	 * Renders sentences with subtle styling that integrates naturally into the message
	 */
	
	import { QuestionMarkCircle } from '$lib'
	
	let { 
		completionItems, 
		images,
		onSentenceSelect 
	}: { 
		completionItems: string[], 
		images?: SentenceImage[],
		onSentenceSelect: (sentence: string) => void 
	} = $props()

	// Generate follow-up prompt for a sentence
	const generatePrompt = (sentence: string): string => {
		// Remove HTML tags for cleaner prompt
		const cleanSentence = sentence.replace(/<[^>]*>/g, '').trim()
		return `Was bedeutet in deiner Antwort '${cleanSentence}'? Erkläre mir das im Kontext unserer Unterhaltung.`
	}

	// Handle sentence click
	const handleSentenceClick = (sentence: string) => {
		const prompt = generatePrompt(sentence)
		onSentenceSelect(prompt)
	}
</script>

<div class="space-y-2">
	{#each completionItems as sentence, index}
		{#if images?.[index]}
			{@const image = images[index]}
			<!-- The sentence right below says the same, so the image is decorative for screen readers -->
			<div class="overflow-hidden rounded-lg border border-gray-200 bg-white {index > 0 ? 'mt-4' : ''}">
				{#if image.state === 'success' && image.url}
					<img src={image.url} alt="" class="w-full h-auto max-h-72 object-contain" />
				{:else if image.state === 'loading'}
					<div class="flex h-40 items-center justify-center gap-2 text-sm text-gray-700 animate-pulse" role="status">
						<div class="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
						Bild wird gezeichnet …
					</div>
				{:else}
					<div class="flex h-16 items-center justify-center text-sm text-gray-700">Kein Bild möglich.</div>
				{/if}
			</div>
		{/if}
		<button
			class="group block w-full text-left text-sm font-normal text-gray-700 dark:text-white leading-relaxed rounded-lg px-3 py-2 pr-8 border border-gray-200/60 dark:border-gray-600/40 bg-gray-50/30 dark:bg-gray-700/20 transition-all duration-200 hover:bg-gray-100/70 dark:hover:bg-gray-600/40 hover:border-gray-300/80 dark:hover:border-gray-500/60 hover:shadow-sm focus:outline-none focus:bg-gray-100/80 dark:focus:bg-gray-600/50 focus:border-gray-400 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-300/50 dark:focus:ring-gray-500/50 cursor-pointer relative {index > 0 ? 'mt-2' : ''}"
			onclick={() => handleSentenceClick(sentence)}
			type="button"
			aria-label="Satz anklicken für Nachfrage: {sentence.replace(/<[^>]*>/g, '').trim()}"
			title="Klicken für Nachfrage zu diesem Satz"
		>
			{@html sentence}
			<!-- Click indicator icon -->
			<span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
				<QuestionMarkCircle class="w-4 h-4" />
			</span>
		</button>
	{/each}
</div>
