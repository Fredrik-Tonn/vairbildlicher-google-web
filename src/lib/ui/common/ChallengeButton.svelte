<script lang="ts">
	import { onMount } from 'svelte'
	import { gsap } from 'gsap'
	import MedalIcon from '$lib/ui/assets/MedalIcon.svelte'
	import GameControllerIcon from '$lib/ui/assets/GameControllerIcon.svelte'

	let { 
		onChallengeClick 
	}: { 
		onChallengeClick: () => void 
	} = $props()

	let buttonRef: HTMLButtonElement | undefined = $state()

	const handleClick = () => {
		// Quick animation on click
		if (buttonRef) {
			gsap.to(buttonRef, {
				scale: 0.95,
				duration: 0.1,
				ease: 'power2.out',
				onComplete: () => {
					if (buttonRef) {
						gsap.to(buttonRef, {
							scale: 1,
							duration: 0.1,
							ease: 'power2.out'
						})
					}
				}
			})
		}
		
		onChallengeClick()
	}

	onMount(() => {
		if (!buttonRef) return
		
		// Subtle waving animation to attract attention
		gsap.to(buttonRef, {
			rotation: 3,
			duration: 0.6,
			ease: 'power2.inOut',
			yoyo: true,
			repeat: -1
		})
		
		// Sparkle effect
		gsap.timeline({ repeat: -1, repeatDelay: 3 })
			.to(buttonRef, {
				boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
				duration: 0.5,
				ease: 'power2.inOut'
			})
			.to(buttonRef, {
				boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
				duration: 0.5,
				ease: 'power2.inOut'
			})
	})
</script>

<div class="flex justify-center mt-4">
	<button
		bind:this={buttonRef}
		onclick={handleClick}
		class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
	>
		<GameControllerIcon size="24" class="inline-block" />
		<span>Bereit für ein Quiz?</span>
		<MedalIcon size="20" class="inline-block" />
	</button>
</div>
