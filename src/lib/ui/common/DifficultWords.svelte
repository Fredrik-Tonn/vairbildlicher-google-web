<script lang="ts">
	let { words, onSelect }: { words: string[], onSelect?: (word: string) => void } = $props()
</script>

<div
	class="mt-4 mb-6"
	role="region"
	aria-label="Schwierige Worte"
>
	<h4 class="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Schwierige Worte</h4>
	<div class="flex flex-wrap gap-2">
		{#each words.filter(word => word && word.trim() !== '') as word}
			<button
				class="py-1.5 px-3 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
				onclick={() => onSelect?.(word)}
				disabled={!onSelect}
				type="button"
				aria-label={onSelect ? `Schwieriges Wort: ${word}. Klicken für Erklärung` : `Schwieriges Wort: ${word}`}
			>
				{word}
			</button>
		{/each}
	</div>
</div>
