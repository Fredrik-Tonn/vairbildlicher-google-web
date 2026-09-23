<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { gsap } from 'gsap'
	import { rewardManager } from '$lib/shared/rewardSystem'
	import type { LevelSystem } from '$lib/shared/domain/verainfacher.model'
	
	let totalCoins = $state(0)
	let levelInfo: LevelSystem | null = $state(null)
	let showLevelUp = $state(false)
	let previousLevel = 0
	let coinDisplayRef: HTMLDivElement | undefined = $state()
	let levelUpRef: HTMLDivElement | undefined = $state()
	
	// Store listener reference for cleanup
	let pointsListener: ((points: number, message: string) => void) | null = null
	
	onMount(() => {
		// Initial load
		updateDisplay()
		
		// Create listener function
		pointsListener = (points: number, message: string) => {
			updateDisplay()
			
			// Animate coin addition
			if (coinDisplayRef) {
				gsap.to(coinDisplayRef, {
					scale: 1.1,
					duration: 0.2,
					ease: 'power2.out',
					yoyo: true,
					repeat: 1
				})
			}
		}
		
		// Listen for point changes
		rewardManager.onPointsAdded(pointsListener)
	})
	
	onDestroy(() => {
		// Clean up listener
		if (pointsListener) {
			rewardManager.removeListener(pointsListener)
		}
	})
	
	const updateDisplay = () => {
		totalCoins = rewardManager.getTotalPoints()
		const newLevel = rewardManager.calculateLevel()
		
		// Check for level up
		if (levelInfo && newLevel.currentLevel > levelInfo.currentLevel) {
			showLevelUp = true
			animateLevelUp()
			setTimeout(() => showLevelUp = false, 3000)
		}
		
		levelInfo = newLevel
	}
	
	const animateLevelUp = () => {
		if (levelUpRef) {
			gsap.fromTo(levelUpRef,
				{ scale: 0, opacity: 0, rotation: -180 },
				{ 
					scale: 1, 
					opacity: 1, 
					rotation: 0,
					duration: 0.8,
					ease: 'back.out(1.7)'
				}
			)
		}
	}
</script>

<style>
	/* Add subtle pulse animation to coin display on hover */
	div:hover .text-2xl {
		animation: pulse 1s infinite;
	}
	
	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}
</style>

<!-- Fixed position coin display -->
<div 
	bind:this={coinDisplayRef}
	class="fixed top-4 left-4 z-40 bg-white rounded-full shadow-lg p-3 flex items-center gap-2 select-none"
	role="status"
	aria-label="Punktestand: {totalCoins} Punkte, Level {levelInfo?.currentLevel} - {levelInfo?.currentLevelName}"
>
	<!-- Level Icon -->
	{#if levelInfo}
		<div class="text-2xl" aria-hidden="true">{levelInfo.currentLevelIcon}</div>
	{/if}
	
	<!-- Coin Count -->
	<div class="flex items-center gap-1">
		<span class="text-2xl" aria-hidden="true">🪙</span>
		<span class="font-bold text-lg text-gray-800">{totalCoins}</span>
	</div>
	
	<!-- Level Progress (optional small indicator) -->
	{#if levelInfo && levelInfo.pointsToNextLevel > 0}
		<div class="w-12 h-2 bg-gray-200 rounded-full overflow-hidden"
			 role="progressbar"
			 aria-valuenow={levelInfo.pointsInCurrentLevel}
			 aria-valuemin="0"
			 aria-valuemax={levelInfo.totalPointsForCurrentLevel}
			 aria-label="Fortschritt zum nächsten Level">
			<div 
				class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
				style="width: {(levelInfo.pointsInCurrentLevel / levelInfo.totalPointsForCurrentLevel) * 100}%"
			></div>
		</div>
	{/if}
</div>

<!-- Level Up Animation -->
{#if showLevelUp && levelInfo}
	<div class="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
		<div 
			bind:this={levelUpRef}
			class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-2xl shadow-2xl text-center"
		>
			<div class="text-6xl mb-2" aria-hidden="true">{levelInfo.currentLevelIcon}</div>
			<div class="text-2xl font-bold mb-1">Level Up!</div>
			<div class="text-xl">{levelInfo.currentLevelName}</div>
			<div class="text-sm mt-2 opacity-90">Level {levelInfo.currentLevel} erreicht!</div>
		</div>
	</div>
{/if}
