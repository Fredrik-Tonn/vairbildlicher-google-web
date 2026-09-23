<script lang="ts">
	/**
	 * FollowUpQuestions component
	 * Displays follow-up questions in a neutral, accessible format directly in the chat flow
	 * Questions are rendered as buttons that can be clicked to continue the conversation
	 */
	
	let { questions, onSelect }: { questions: string[], onSelect: (question: string) => void } = $props()
</script>

<div
	class="mt-4 mb-6 mx-auto text-center"
	role="region"
	aria-label="Folgefragen"
>
	<div class="flex flex-wrap justify-center gap-3">
		{#each questions.filter(q => q && q.trim() !== '') as question}
			<button
				class="py-2 px-3 rounded-xl bg-stone-300 dark:bg-stone-900 text-gray-800 dark:text-white text-sm hover:bg-stone-400 dark:hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
				onclick={() => onSelect(question)}
				aria-label={"Folgefrage: " + question}
			>
				{question}
			</button>
		{/each}
	</div>
</div>
