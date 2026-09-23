<script lang="ts">
	// AI notice (short terms of use) as a normal full-screen page below the global header.
	// Was a modal with a black backdrop and a framed heading.
	import { onMount } from 'svelte'
	import { setReadAloudSource } from '$lib/ui/a11y-settings.svelte'

	let { onClose }: { onClose: () => void } = $props()

	let headingRef: HTMLHeadingElement | undefined = $state()
	let contentRef: HTMLDivElement | undefined = $state()

	onMount(() => {
		// Move focus to the heading so screen readers start reading at the top of the page
		headingRef?.focus()
		// "Vorlesen" in the global header reads this page's text
		return setReadAloudSource(readAloudText)
	})

	// Page text without decorative parts (icon ligature, emoji) marked with data-no-read
	const readAloudText = () => {
		if (!contentRef) return ''
		const copy = contentRef.cloneNode(true) as HTMLElement
		copy.querySelectorAll('[data-no-read]').forEach((el) => el.remove())
		return Array.from(copy.querySelectorAll('p, h1, button'))
			.map((el) => el.textContent?.replace(/\s+/g, ' ').trim() ?? '')
			.filter(Boolean)
			.join(' ')
	}
</script>

<div class="min-h-full bg-page font-sans text-ink">
	<div bind:this={contentRef} class="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
		<h1
			bind:this={headingRef}
			tabindex="-1"
			class="font-display text-[1.75rem] font-bold leading-tight tracking-tight focus:outline-none sm:text-4xl"
		>
			<!-- Each part on its own line on every screen size -->
			<span class="block">Nutzungs-Bedingungen</span>
			<span class="block">Kurz-Fassung</span>
		</h1>

		<div class="mt-6 space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg">
			<p>Sie kommunizieren jetzt mit einem Computer-Programm, das künstliche Intelligenz (KI) nutzt.</p>
			<p>Alle Texte werden ausschließlich von diesem Programm und nicht von einem Menschen erstellt.</p>
			<p>Bitte verlassen Sie sich bei wichtigen Informationen oder Entscheidungen nicht allein auf dieses Programm.</p>
			<p>Fragen Sie zur Sicherheit unbedingt eine Person Ihres Vertrauens, die sich gut auskennt.</p>
			<p>
				<a
					href="https://kopfhandundfuss.de/nutzungsbedingungen-verainfacher/"
					target="_blank"
					rel="noopener"
					class="font-bold text-brand underline underline-offset-4 hover:text-brand-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
				>
					Nutzungsbedingungen (lange Fassung)
				</a>
			</p>
		</div>

		<div class="mt-8 font-semibold text-ink sm:text-lg">
			<!-- Refer to the button by its label, not its colour (WCAG 1.3.3) -->
			<p>Sind Sie einverstanden?</p>
			<p>Dann klicken Sie auf <strong>OK</strong>.</p>
		</div>

		<button
			type="button"
			onclick={onClose}
			class="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand px-10 text-lg font-semibold text-white shadow-md hover:bg-brand-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
		>
			<!-- Accessible name = visible label "OK" (WCAG 2.5.3) -->
			OK
		</button>
	</div>
</div>
