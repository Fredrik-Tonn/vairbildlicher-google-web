<script lang="ts">
	import { onMount } from 'svelte'
	import { gsap } from 'gsap'

	let { 
		coinsEarned,
		onComplete 
	}: { 
		coinsEarned: number,
		onComplete: () => void 
	} = $props()

	let overlayRef: HTMLDivElement | undefined = $state()
	let bagRef: HTMLDivElement | undefined = $state()
	let coinsContainer: HTMLDivElement | undefined = $state()

	// Start the coin collection animation
	const startAnimation = () => {
		if (!bagRef || !coinsContainer || !overlayRef) return

		// 1. Show bag with bounce animation
		gsap.fromTo(bagRef, 
			{ 
				y: 100, 
				scale: 0.5, 
				opacity: 0 
			},
			{ 
				y: 0, 
				scale: 1, 
				opacity: 1, 
				duration: 0.8, 
				ease: 'back.out(1.7)'
			}
		)

		// 2. Find trophy position as starting point for coins
		const trophyElement = document.querySelector('.result-item .text-6xl')
		let startX = window.innerWidth / 2 // fallback to center
		let startY = window.innerHeight / 2 // fallback to center

		if (trophyElement) {
			const trophyRect = trophyElement.getBoundingClientRect()
			startX = trophyRect.left + trophyRect.width / 2
			startY = trophyRect.top + trophyRect.height / 2
		}

		// 3. Get bag position as target
		const bagRect = bagRef.getBoundingClientRect()
		const bagX = bagRect.left + bagRect.width / 2
		const bagY = bagRect.top + bagRect.height / 2

		// 4. Create and animate coins
		const coinCount = Math.min(coinsEarned, 15) // Max 15 coins for performance
		
		for (let i = 0; i < coinCount; i++) {
			setTimeout(() => {
				createAndAnimateCoin(startX, startY, bagX, bagY, i)
			}, i * 100) // Stagger coin creation
		}

		// 5. Shake bag when coins arrive
		setTimeout(() => {
			if (bagRef) {
				gsap.to(bagRef, {
					rotation: 3,
					duration: 0.1,
					yoyo: true,
					repeat: 10,
					ease: 'power2.inOut'
				})
			}
		}, 800)

		// 6. Hide overlay after animation
		setTimeout(() => {
			if (overlayRef) {
				gsap.to(overlayRef, {
					opacity: 0,
					duration: 0.5,
					onComplete: onComplete
				})
			}
		}, 3000)
	}

	// Create and animate a single coin
	const createAndAnimateCoin = (startX: number, startY: number, targetX: number, targetY: number, index: number) => {
		if (!coinsContainer) return

		const coin = document.createElement('div')
		coin.innerHTML = `
			<svg width="32" height="32" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="text-yellow-600">
				<g>
					<g>
						<g>
							<circle cx="256" cy="256" fill="#ffee80" r="246" />
							<circle cx="256" cy="256" fill="#fff7bf" r="196" />
							<path d="m331.272 188.229h-150.544l-49.689 49.689c41.654 41.951 83.307 83.902 124.961 125.853l124.96-125.854z" fill="#bfdbff" />
						</g>
					</g>
					<g>
						<path d="m173.657 181.158-49.688 49.689c-3.896 3.895-3.906 10.208-.025 14.117l124.961 125.854c1.878 1.891 4.433 2.954 7.097 2.954 2.665 0 5.219-1.064 7.097-2.954l124.959-125.854c3.881-3.909 3.87-10.222-.025-14.117l-49.689-49.689c-1.876-1.876-4.419-2.929-7.071-2.929h-150.544c-2.653 0-5.196 1.053-7.072 2.929zm33.466 66.759 26.031 78.651-78.093-78.651zm149.816 0-78.094 78.653 26.031-78.653zm-73.129 0-27.81 84.028-27.81-84.027h55.62zm-55.589-20 9.896-29.689h35.766l9.896 29.689zm128.596 0h-51.956l-9.896-29.689h32.164zm-139.782-29.688-9.896 29.689h-51.957l29.689-29.689z" />
						<path d="m302.818 4.273c-5.425-1.001-10.647 2.584-11.65 8.016-1.004 5.431 2.584 10.647 8.016 11.651 111.725 20.654 192.816 118.249 192.816 232.06 0 130.131-105.869 236-236 236s-236-105.869-236-236c0-113.811 81.091-211.406 192.816-232.06 5.432-1.004 9.02-6.22 8.016-11.651-1.003-5.431-6.222-9.013-11.65-8.016-121.208 22.407-209.182 128.273-209.182 251.727 0 68.38 26.629 132.668 74.98 181.019 48.353 48.353 112.64 74.981 181.02 74.981s132.667-26.628 181.02-74.981c48.351-48.351 74.98-112.639 74.98-181.019 0-123.454-87.974-229.32-209.182-251.727z" />
						<circle cx="256" cy="10" r="10" />
						<path d="m50 256c0 113.589 92.411 206 206 206s206-92.411 206-206-92.411-206-206-206-206 92.411-206 206zm392 0c0 102.56-83.44 186-186 186s-186-83.44-186-186 83.439-186 186-186 186 83.439 186 186z" />
					</g>
				</g>
			</svg>
		`
		coin.className = 'absolute pointer-events-none'
		coin.style.color = '#fbbf24' // text-yellow-600
		coinsContainer.appendChild(coin)

		// Calculate burst direction - coins spread out upward in a fan pattern
		const angle = -Math.PI/2 + (Math.random() - 0.5) * Math.PI * 0.6 // Upward fan spread (108 degrees)
		const burstDistance = 60 + Math.random() * 40 // 60-100px burst distance
		const burstX = startX + Math.cos(angle) * burstDistance
		const burstY = startY + Math.sin(angle) * burstDistance

		// Set initial position at start point
		gsap.set(coin, {
			x: startX,
			y: startY,
			scale: 0,
			rotation: 0
		})

		// Animation timeline
		const timeline = gsap.timeline()
		
		// 1. Burst out from center with explosive motion
		timeline.to(coin, {
			x: burstX,
			y: burstY,
			scale: 1.2,
			rotation: Math.random() * 360,
			duration: 0.4,
			ease: 'power2.out'
		})

		// 2. Curved arc motion towards the bag
		// X-movement: direct path to bag
		timeline.to(coin, {
			x: targetX + (Math.random() - 0.5) * 40, // Some randomness around bag
			scale: 1,
			duration: 1.0,
			ease: 'power1.inOut'
		}, 0.2)

		// Y-movement: arc upward then down (creates curved path)
		timeline.to(coin, {
			y: burstY - 60, // Go up first for arc effect
			duration: 0.4,
			ease: 'power2.out'
		}, 0.2)

		// 3. Drop into bag
		timeline.to(coin, {
			y: targetY - 20,
			rotation: '+=360',
			duration: 0.6,
			ease: 'power2.in'
		}, 0.6)

		// 4. Final drop into bag
		timeline.to(coin, {
			y: targetY,
			scale: 0.6,
			rotation: '+=180',
			duration: 0.2,
			ease: 'power2.in'
		})

		// 4. Fade out when collected
		timeline.to(coin, {
			scale: 0.2,
			opacity: 0,
			duration: 0.2,
			ease: 'power2.in'
		})

		// Remove coin
		timeline.call(() => {
			coin.remove()
		})
	}

	onMount(() => {
		// Start animation after short delay
		setTimeout(startAnimation, 500)
	})
</script>

<!-- Animation Overlay -->
<div 
	bind:this={overlayRef}
	class="fixed inset-0 z-[100000] pointer-events-none coin-animation-layer"
	style="background: transparent; position: fixed !important;"
>
	<!-- Coins Container -->
	<div bind:this={coinsContainer} class="absolute inset-0"></div>
	
	<!-- Coin Bag at bottom -->
	<div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
		<div bind:this={bagRef} class="text-center">
			<!-- Bag with glow effect -->
			<div class="relative">
				<div class="text-6xl drop-shadow-lg">💰</div>
				
				<!-- Sparkle effects around bag -->
				<div class="absolute inset-0 animate-ping">
					<div class="absolute top-0 left-0 text-xl opacity-60">✨</div>
					<div class="absolute top-0 right-0 text-xl opacity-60 animation-delay-200">✨</div>
					<div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xl opacity-60 animation-delay-400">✨</div>
				</div>
			</div>
			
			<!-- Collected coins counter -->
			<div class="mt-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
				+{coinsEarned} Coins!
			</div>
		</div>
	</div>
</div>

<style>
	.animation-delay-200 {
		animation-delay: 0.2s;
	}
	
	.animation-delay-400 {
		animation-delay: 0.4s;
	}
</style>
