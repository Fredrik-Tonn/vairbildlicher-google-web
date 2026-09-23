<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { gsap } from 'gsap'
	import { rewardManager } from '$lib/shared/rewardSystem'
	import type { LevelSystem } from '$lib/shared/domain/verainfacher.model'
	import { LEVEL_DEFINITIONS } from '$lib/shared/domain/verainfacher.model'
	
	// Import all icons
	import CoinIcon from '$lib/ui/assets/CoinIcon.svelte'
	import MouseIcon from '$lib/ui/assets/MouseIcon.svelte'
	import CatIcon from '$lib/ui/assets/CatIcon.svelte'
	import LeopardIcon from '$lib/ui/assets/LeopardIcon.svelte'
	import PumaIcon from '$lib/ui/assets/PumaIcon.svelte'
	import TigerIcon from '$lib/ui/assets/TigerIcon.svelte'
	import BlackPantherIcon from '$lib/ui/assets/BlackPantherIcon.svelte'
	import LionIcon from '$lib/ui/assets/LionIcon.svelte'
	import QuestionMarkCircle from '$lib/ui/assets/QuestionMarkCircle.svelte'
	import EllipsisVerticalSolid from '$lib/ui/assets/EllipsisVerticalSolid.svelte'
	import MenuDropdown from '$lib/ui/common/MenuDropdown.svelte'
	import HelpLink from '$lib/ui/common/HelpLink.svelte'
	
	// Icon mapping
	const iconComponents: Record<string, any> = {
		'MouseIcon': MouseIcon,
		'CatIcon': CatIcon,
		'LeopardIcon': LeopardIcon,
		'PumaIcon': PumaIcon,
		'TigerIcon': TigerIcon,
		'BlackPantherIcon': BlackPantherIcon,
		'LionIcon': LionIcon
	}
	
	let { onNewChat, inputDisabled = false }: { onNewChat: () => void, inputDisabled?: boolean } = $props()
	
	let totalCoins = $state(0)
	let levelInfo: LevelSystem | null = $state(null)
	let showLevelUp = $state(false)
	let showLevelTooltip = $state(false)
	let headerRef: HTMLElement | undefined = $state()
	let coinsRef: HTMLDivElement | undefined = $state()
	let levelUpRef: HTMLDivElement | undefined = $state()
	let levelButtonRef: HTMLButtonElement | undefined = $state()
	
	// Store listener reference for cleanup
	let pointsListener: ((points: number, message: string) => void) | null = null
	
	onMount(() => {
		// Initial load
		updateDisplay()
		
		// Create listener function
		pointsListener = (points: number, message: string) => {
			updateDisplay()
			
			// Animate coin addition
			if (coinsRef) {
				gsap.to(coinsRef, {
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
		
		// Close tooltip on outside click
		const handleClickOutside = (event: MouseEvent) => {
			if (showLevelTooltip && levelButtonRef && !levelButtonRef.contains(event.target as Node)) {
				showLevelTooltip = false
			}
		}
		
		document.addEventListener('click', handleClickOutside)
		
		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
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
	
	const toggleLevelTooltip = () => {
		showLevelTooltip = !showLevelTooltip
	}
	
	const getNextLevelInfo = () => {
		if (!levelInfo) return null
		
		const currentLevelIndex = levelInfo.currentLevel - 1
		if (currentLevelIndex < LEVEL_DEFINITIONS.length - 1) {
			return LEVEL_DEFINITIONS[currentLevelIndex + 1]
		}
		return null
	}
</script>

<style>
	.chat-header {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1rem;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		height: 60px;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 40;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}
	
	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		max-width: 1280px;
		margin: 0 auto;
	}
	
	.header-left {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}
	
	.header-center {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.coins-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: #374151;
	}
	
	.coins-icon {
		font-size: 1.5rem;
		line-height: 1;
	}
	
	.points {
		font-size: 1.125rem;
	}
	
	.progress-section {
		width: 120px;
	}
	
	.progress-bar {
		width: 100%;
		height: 8px;
		background-color: #e5e7eb;
		border-radius: 9999px;
		overflow: hidden;
		position: relative;
	}
	
	.progress-fill {
		height: 100%;
		background: linear-gradient(to right, #fbbf24, #f97316);
		transition: width 0.5s ease;
		border-radius: 9999px;
	}
	
	.level-section {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s;
		position: relative;
	}
	
	.level-section:hover {
		transform: scale(1.1);
	}
	
	.level-section:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		border-radius: 0.5rem;
	}
	
	:global(.level-icon) {
		width: 40px;
		height: 40px;
	}
	
	
	/* Desktop styles */
	@media (min-width: 768px) {
		.chat-header {
			padding: 0.75rem 2rem;
		}
		
		.header-left {
			gap: 2rem;
		}
		
		.progress-section {
			width: 150px;
		}
		
		.progress-bar {
			height: 10px;
		}
		
		.coins-icon {
			font-size: 1.75rem;
		}
		
		.points {
			font-size: 1.25rem;
		}
		
		:global(.level-icon) {
			width: 48px;
			height: 48px;
		}
		
	}
	
	/* Mobile responsiveness */
	@media (max-width: 767px) {
		.chat-header {
			padding: 0.5rem 0.75rem;
		}
		
		.header-content {
			gap: 0.5rem;
		}
		
		.header-left {
			gap: 0.75rem;
		}
		
		.header-center {
			gap: 0.5rem;
		}
		
		.progress-section {
			width: 80px;
		}
		
	}
	
	/* Level Tooltip Styles */
	.level-tooltip {
		position: absolute;
		top: calc(100% + 12px);
		left: 50%;
		transform: translateX(-50%);
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		padding: 1rem;
		min-width: 240px;
		z-index: 50;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.2s, visibility 0.2s;
	}
	
	.level-tooltip.show {
		opacity: 1;
		visibility: visible;
	}
	
	.level-tooltip::before {
		content: '';
		position: absolute;
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 12px;
		height: 12px;
		background: white;
		border-left: 1px solid #e5e7eb;
		border-top: 1px solid #e5e7eb;
		transform: translateX(-50%) rotate(45deg);
	}
	
	.tooltip-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.tooltip-level-info {
		flex: 1;
	}
	
	.tooltip-level-name {
		font-weight: 600;
		color: #111827;
		font-size: 1rem;
	}
	
	.tooltip-level-subtitle {
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.tooltip-progress {
		margin-bottom: 0.75rem;
	}
	
	.tooltip-progress-bar {
		width: 100%;
		height: 8px;
		background-color: #e5e7eb;
		border-radius: 9999px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}
	
	.tooltip-progress-fill {
		height: 100%;
		background: linear-gradient(to right, #fbbf24, #f97316);
		transition: width 0.5s ease;
		border-radius: 9999px;
	}
	
	.tooltip-progress-text {
		font-size: 0.875rem;
		color: #6b7280;
		text-align: center;
	}
	
	.tooltip-next-level {
		font-size: 0.875rem;
		color: #6b7280;
		text-align: center;
		padding-top: 0.75rem;
		border-top: 1px solid #e5e7eb;
	}
	
	.tooltip-next-level strong {
		color: #374151;
	}
	
	/* Mobile adjustments */
	@media (max-width: 767px) {
		.level-tooltip {
			min-width: 200px;
			padding: 0.75rem;
			font-size: 0.875rem;
		}
		
		.tooltip-level-name {
			font-size: 0.875rem;
		}
		
		.tooltip-level-subtitle,
		.tooltip-progress-text,
		.tooltip-next-level {
			font-size: 0.75rem;
		}
	}
</style>

<header bind:this={headerRef} class="chat-header" role="banner">
	<div class="header-content">
		<!-- Left Section: Coins and Progress -->
		<div class="header-left">
			<!-- Coins Section -->
			<div 
				bind:this={coinsRef}
				class="coins-section" 
				aria-label="Aktuelle Punkte: {totalCoins}"
			>
				<CoinIcon size="28" class="coins-icon text-yellow-600" aria-hidden="true" />
				<span class="points">{totalCoins}</span>
			</div>
			
			<!-- Progress Section -->
			{#if levelInfo && levelInfo.pointsToNextLevel > 0}
				<div 
					class="progress-section" 
					aria-label="Level-Fortschritt: {Math.round((levelInfo.pointsInCurrentLevel / levelInfo.totalPointsForCurrentLevel) * 100)}%"
				>
					<div 
						class="progress-bar"
						role="progressbar"
						aria-valuenow={levelInfo.pointsInCurrentLevel}
						aria-valuemin="0"
						aria-valuemax={levelInfo.totalPointsForCurrentLevel}
					>
						<div 
							class="progress-fill"
							style="width: {(levelInfo.pointsInCurrentLevel / levelInfo.totalPointsForCurrentLevel) * 100}%"
						></div>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Center Section: Level Icon -->
		<div class="header-center">
			{#if levelInfo}
				<button 
					bind:this={levelButtonRef}
					class="level-section" 
					aria-label="Aktuelles Level: {levelInfo.currentLevelName}"
					title="Level {levelInfo.currentLevel}: {levelInfo.currentLevelName}"
					type="button"
					onclick={toggleLevelTooltip}
				>
					{#if iconComponents[levelInfo.currentLevelIcon]}
						<svelte:component 
							this={iconComponents[levelInfo.currentLevelIcon]} 
							size="40"
							class="level-icon"
							aria-hidden="true"
						/>
					{/if}
					
					<!-- Level Info Tooltip -->
					<div class="level-tooltip {showLevelTooltip ? 'show' : ''}">
						<div class="tooltip-header">
							{#if iconComponents[levelInfo.currentLevelIcon]}
								<svelte:component 
									this={iconComponents[levelInfo.currentLevelIcon]} 
									size="32"
									class="text-gray-700"
								/>
							{/if}
							<div class="tooltip-level-info">
								<div class="tooltip-level-name">Level {levelInfo.currentLevel}: {levelInfo.currentLevelName}</div>
								<div class="tooltip-level-subtitle">Aktueller Rang</div>
							</div>
						</div>
						
						<div class="tooltip-progress">
							<div class="tooltip-progress-bar">
								<div 
									class="tooltip-progress-fill"
									style="width: {(levelInfo.pointsInCurrentLevel / levelInfo.totalPointsForCurrentLevel) * 100}%"
								></div>
							</div>
							<div class="tooltip-progress-text">
								{levelInfo.pointsInCurrentLevel} / {levelInfo.totalPointsForCurrentLevel} Punkte
							</div>
						</div>
						
						{#if getNextLevelInfo()}
							{@const nextLevel = getNextLevelInfo()}
							{#if nextLevel}
								<div class="tooltip-next-level">
									Nächstes Level: <strong>{nextLevel.name}</strong><br>
									Noch {levelInfo.pointsToNextLevel} Punkte
								</div>
							{/if}
						{:else}
							<div class="tooltip-next-level">
								<strong>Höchstes Level erreicht!</strong>
							</div>
						{/if}
					</div>
				</button>
			{/if}
		</div>

		<!-- Right Section: Helper Icon and Menu Button -->
		<div class="flex items-center gap-2 ml-auto">
			<HelpLink></HelpLink>
			<MenuDropdown onNewChat={onNewChat} {inputDisabled} showNewChat={true} />
		</div>

	</div>
</header>

<!-- Level Up Animation -->
{#if showLevelUp && levelInfo}
	<div class="fixed inset-0 z-[100001] flex items-center justify-center pointer-events-none level-up-animation">
		<div 
			bind:this={levelUpRef}
			class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-2xl shadow-2xl text-center"
		>
			<div class="mb-2 flex justify-center" aria-hidden="true">
				{#if iconComponents[levelInfo.currentLevelIcon]}
					<svelte:component 
						this={iconComponents[levelInfo.currentLevelIcon]} 
						size="64"
						class="text-white"
					/>
				{/if}
			</div>
			<div class="text-2xl font-bold mb-1">Level Up!</div>
			<div class="text-xl">{levelInfo.currentLevelName}</div>
			<div class="text-sm mt-2 opacity-90">Level {levelInfo.currentLevel} erreicht!</div>
		</div>
	</div>
{/if}
