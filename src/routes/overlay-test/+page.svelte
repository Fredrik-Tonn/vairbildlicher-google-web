<script lang="ts">
	import { createMockChallenge } from '$lib/shared/mockChallenge'
	import ChallengeOverlay from '$lib/ui/modules/ChallengeOverlay.svelte'
	import type { Challenge } from '$lib/shared/domain/verainfacher.model'

	let showOverlay = $state(false)
	let challenge: Challenge | null = $state(null)

	const startTest = () => {
		challenge = createMockChallenge()
		showOverlay = true
	}

	const handleComplete = (results: { correct: number, total: number, percentage: number }) => {
		showOverlay = false
		challenge = null
		alert(`Test abgeschlossen! ${results.correct}/${results.total} richtig (${results.percentage}%)`)
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<div class="text-center">
		<h1 class="text-4xl font-bold mb-8">Challenge Overlay Test</h1>
		<button 
			onclick={startTest}
			class="bg-purple-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-purple-600 transition-colors"
		>
			🎮 Challenge starten
		</button>
	</div>
</div>

{#if showOverlay && challenge}
	<ChallengeOverlay 
		{challenge} 
		onComplete={handleComplete} 
	/>
{/if}
