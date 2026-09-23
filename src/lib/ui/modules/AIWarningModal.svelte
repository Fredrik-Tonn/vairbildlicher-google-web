<script lang="ts">
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
	
	let { onClose }: { onClose: () => void } = $props()
	
	let modalRef: HTMLDivElement | undefined = $state()
	let okButtonRef: HTMLButtonElement | undefined = $state()
	
	onMount(() => {
		// Focus the OK button when modal opens
		okButtonRef?.focus()
		
		// Trap focus within modal
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
			
			if (e.key === 'Tab' && modalRef) {
				const focusableElements = modalRef.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				)
				const firstElement = focusableElements[0] as HTMLElement
				const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
				
				if (e.shiftKey) {
					// Tab backwards
					if (document.activeElement === firstElement) {
						lastElement?.focus()
						e.preventDefault()
					}
				} else {
					// Tab forwards
					if (document.activeElement === lastElement) {
						firstElement?.focus()
						e.preventDefault()
					}
				}
			}
		}
		
		document.addEventListener('keydown', handleKeyDown)
		
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	})
</script>

<!-- Overlay -->
<div 
	class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
	transition:fade={{ duration: 200 }}
	role="dialog"
	aria-modal="true"
	aria-labelledby="ai-warning-title"
	aria-describedby="ai-warning-description"
	bind:this={modalRef}
>
	<!-- Modal Box - more subtle design -->
	<div 
		class="relative w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
	>
		<!-- Subtle header -->
		<div class="px-6 py-4 sm:px-8 sm:py-5 bg-gray-50 border-b border-gray-200">
			<h2 id="ai-warning-title" class="text-lg sm:text-xl font-semibold text-gray-700 text-center">
				Achtung!
			</h2>
		</div>
		
		<!-- Content -->
		<div class="px-6 py-6 sm:px-8 sm:py-8">
			<!-- Info text with line breaks -->
			<div id="ai-warning-description" class="text-sm sm:text-base leading-relaxed text-gray-700 space-y-3">
				<h4 class="text-2xl font-bold">Nutzungs-Bedingungen Kurz-Fassung</h4>
				<p>Sie kommunizieren jetzt mit einem Computer-Programm, das künstliche Intelligenz (KI) nutzt.</p>
				<p>Alle Texte werden ausschließlich von diesem Programm und nicht von einem Menschen erstellt.</p>
				<p>Bitte verlassen Sie sich bei wichtigen Informationen oder Entscheidungen nicht allein auf dieses Programm.</p>
				<p>Fragen Sie zur Sicherheit unbedingt eine Person Ihres Vertrauens, die sich gut auskennt.</p>
				<a href="https://kopfhandundfuss.de/nutzungsbedingungen-verainfacher/" target="_blank"
					 class="text-md font-bold text-blue-500 hover:text-blue-800">
					Nutzungsbedingungen (lange Fassung)
				</a>
				<p class="font-semibold mt-4">Sind Sie einverstanden? Dann klicken Sie auf den blauen Knopf.</p>
				<p class="font-semibold mt-4">Auf dem Knopf steht: OK.</p>
			</div>

			<!-- OK Button -->
			<div class="flex justify-center mt-6">
				<button
					bind:this={okButtonRef}
					onclick={onClose}
					class="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold
						rounded-full transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer"
					aria-label="Zustimmen und fortfahren"
				>
					<span class="text-lg">OK</span>
					<span class="text-xl">👍</span>
				</button>
			</div>
		</div>
	</div>
</div>
