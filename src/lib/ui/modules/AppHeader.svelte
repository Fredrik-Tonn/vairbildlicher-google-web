<script lang="ts">
	// Global header for all views: logo (link to the project page) and the accessibility menu.
	// Button labels are visible text and double as the accessible name (WCAG 2.5.3).
	import { onDestroy, onMount } from 'svelte'
	import {
		a11ySettings,
		cycleTextSize,
		getReadAloudText,
		loadA11ySettings,
		toggleContrast
	} from '$lib/ui/a11y-settings.svelte'

	const PROJECT_URL = 'https://kopfhandundfuss.de/projekte/der-verainfacher/'

	let ttsState = $state<'idle' | 'loading' | 'playing'>('idle')
	let audio: HTMLAudioElement | null = null

	onMount(loadA11ySettings)
	onDestroy(() => audio?.pause())

	const readAloud = async () => {
		if (ttsState === 'playing') {
			audio?.pause()
			ttsState = 'idle'
			return
		}
		if (ttsState === 'loading') return

		const text = getReadAloudText()
		if (!text) return

		try {
			ttsState = 'loading'
			const response = await fetch('/api/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			})
			const result = await response.json()
			if (!response.ok || result.error) throw new Error(result.error || 'TTS fehlgeschlagen')

			const blob = new Blob([Uint8Array.from(atob(result.audio), (c) => c.charCodeAt(0))], { type: result.mimeType })
			audio = new Audio(URL.createObjectURL(blob))
			audio.onended = () => (ttsState = 'idle')
			await audio.play()
			ttsState = 'playing'
		} catch (e) {
			console.error('Vorlesen fehlgeschlagen:', e)
			ttsState = 'idle'
		}
	}

	const buttonClass =
		'flex h-14 min-w-16 flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-ink hover:bg-muted-strong focus-visible:outline-2 focus-visible:outline-brand aria-pressed:bg-muted-strong'
</script>

<!-- z-[5]: below fixed modals, which layout.css caps at z-index 10 -->
<header class="relative z-[5] shrink-0 border-b border-line bg-surface font-sans">
	<!-- Same content width as the pages: full width on phones, up to 80rem with growing margins -->
	<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 py-2">
		<a
			href={PROJECT_URL}
			target="_blank"
			rel="noopener"
			aria-label="Der Verainfacher – Im Dialog mit KI Texte verstehen. Projekt-Seite, öffnet in neuem Fenster"
			class="shrink-0 rounded-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
		>
			<img src="/images/verainfacher-logo.svg" alt="" class="h-14 w-auto sm:h-16" />
		</a>

		<div class="flex items-center gap-1 rounded-xl bg-muted p-1 hc-outline" role="toolbar" aria-label="Barrierefreiheit">
			<!-- aria-label repeats the visible label exactly (WCAG 2.5.3), so simple tools find the name too.
			     No title attributes: tooltips are not reachable on touch. -->
			<button type="button" onclick={cycleTextSize} class={buttonClass} aria-label="Schrift">
				<span class="material-symbols-rounded text-[24px]" aria-hidden="true">format_size</span>
				<span class="text-xs font-semibold">Schrift</span>
			</button>
			<button
				type="button"
				onclick={toggleContrast}
				class={buttonClass}
				aria-pressed={a11ySettings.highContrast}
				aria-label="Kontrast"
			>
				<span class="material-symbols-rounded text-[24px]" aria-hidden="true">contrast</span>
				<span class="text-xs font-semibold">Kontrast</span>
			</button>
			<button
				type="button"
				onclick={readAloud}
				class={buttonClass}
				aria-pressed={ttsState === 'playing'}
				aria-label={ttsState === 'playing' ? 'Stopp' : 'Vorlesen'}
			>
				<span class="material-symbols-rounded text-[24px] {ttsState === 'loading' ? 'animate-pulse' : ''}" aria-hidden="true">
					{ttsState === 'playing' ? 'stop_circle' : 'volume_up'}
				</span>
				<span class="text-xs font-semibold">{ttsState === 'playing' ? 'Stopp' : 'Vorlesen'}</span>
			</button>
		</div>
	</div>
</header>
