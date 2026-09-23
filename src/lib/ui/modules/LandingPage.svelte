<script lang="ts">
	// Landing page after the Figma mockup "A11y_Designs" (frame 3 of 3, plus frame 2 as drop zone).
	// Texts follow the mockup 1:1 on purpose; corrections come step by step afterwards.
	import { onMount } from 'svelte'
	import type { ImageInfo } from '$lib'
	import MultiPhotoCapture from '$lib/ui/modules/MultiPhotoCapture.svelte'
	import { setReadAloudSource } from '$lib/ui/a11y-settings.svelte'

	let { onPhotosComplete, onCancel }: {
		onPhotosComplete: (images: ImageInfo[]) => void,
		onCancel: () => void
	} = $props()

	const HELP_URL = 'https://kopfhandundfuss.de/projekte/der-verainfacher/'

	const steps = [
		{
			number: 1,
			icon: 'document_scanner',
			title: 'Foto machen oder hochladen',
			// One sentence per line
			lines: ['Halten Sie die Kamera auf den Brief.', 'Oder wählen Sie eine Datei aus.'],
			image: '/images/landing/schritt-1-foto.jpg',
			alt: 'Ein Smartphone fotografiert einen Brief auf einem Tisch.'
		},
		{
			number: 2,
			icon: 'psychology',
			title: 'Der Verainfacher macht es einfach',
			lines: [
				'Sie müssen nur wenige Sekunden warten.',
				'Der Verainfacher macht Fremd-Wörter einfach.',
				'Lange Sätze werden kurz und klar.'
			],
			image: '/images/landing/schritt-2-ki.jpg',
			alt: 'Ein Tablet mit einem Text. Darüber leuchten verbundene Punkte.'
		},
		{
			number: 3,
			icon: 'hearing',
			title: 'Lesen oder anhören',
			lines: [
				'Der einfache Text wird angezeigt.',
				'Sie können ihn leicht lesen.',
				'Oder tippen auf Vorlesen.',
				'Zum Anhören.'
			],
			image: '/images/landing/schritt-3-lesen.jpg',
			alt: 'Eine ältere Frau sitzt lächelnd vor einem Tablet. Daneben liegen Kopfhörer.'
		}
	]

	// Light → medium → dark supports the order 1, 2, 3 (tokens in layout.css).
	// Step 1 gets a ring, as its light fill barely stands out from the white card.
	const stepColors = [
		'bg-step-1 text-step-1-ink ring-2 ring-inset ring-step-2',
		'bg-step-2 text-step-2-ink',
		'bg-step-3 text-step-3-ink'
	]

	let photoCapture: MultiPhotoCapture | undefined = $state()
	let rootElem: HTMLElement | undefined = $state()
	let scrollContainer: HTMLElement | null = null
	let showScrollTop = $state(false)
	let isDragging = $state(false)

	onMount(() => {
		const unregisterReadAloud = setReadAloudSource(readAloudText)
		scrollContainer = rootElem?.closest('.app-content') ?? null
		const onScroll = () => (showScrollTop = (scrollContainer?.scrollTop ?? 0) > 600)
		scrollContainer?.addEventListener('scroll', onScroll, { passive: true })
		return () => {
			scrollContainer?.removeEventListener('scroll', onScroll)
			unregisterReadAloud()
		}
	})

	const scrollToTop = () => scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })

	// Text for "Vorlesen" in the global header
	const readAloudText = () =>
		[
			'Der Verainfacher hilft beim Verstehen.',
			'Foto erstellen. Drücken Sie auf Foto erstellen. Ihre Kamera öffnet sich direkt.',
			'Datei hochladen.',
			...steps.map((step) => `Schritt ${step.number}: ${step.title}. ${step.lines.join(' ')}`)
		].join(' ')

	// Drag & drop of files anywhere on the page (mockup frame 2)
	const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes('Files')

	const onDragOver = (event: DragEvent) => {
		if (!hasFiles(event)) return
		event.preventDefault()
		isDragging = true
	}

	const onDragLeave = (event: DragEvent) => {
		if (event.relatedTarget === null) isDragging = false
	}

	const onDrop = (event: DragEvent) => {
		if (!hasFiles(event)) return
		event.preventDefault()
		isDragging = false
		if (event.dataTransfer?.files.length) photoCapture?.addFiles(event.dataTransfer.files)
	}
</script>

<svelte:window ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop} />

<div bind:this={rootElem} class="min-h-full bg-page font-sans text-ink">
	<!-- Mobile first, full width on all devices: content grows up to 80rem, grids from md -->
	<main>
		<!-- Hero (full width) -->
		<section class="bg-gradient-to-b from-page-tint to-page px-4 pb-6 pt-8 text-center sm:pb-10 sm:pt-12 lg:pt-16">
			<h1 class="font-display text-[2rem] font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Verainfacher</h1>
			<p class="mt-3 text-base text-ink-soft sm:text-lg">Der Verainfacher hilft beim Verstehen.</p>
		</section>

		<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Photo + upload: stacked on phones, side by side from md -->
		<div class="grid gap-4 md:grid-cols-2">

		<!-- Card: Text fotografieren -->
		<section class="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6" aria-labelledby="card-photo-title">
			<div class="flex items-center gap-3">
				<!-- Plain icon without a tile, so it does not look like a button -->
				<span class="material-symbols-rounded text-[32px] text-ink" aria-hidden="true">photo_camera</span>
				<h2 id="card-photo-title" class="font-display text-xl font-semibold">Foto erstellen</h2>
			</div>
			<p class="mb-4 mt-4 text-base leading-relaxed text-ink-soft">
				<!-- Refer to the button by its label, not its colour (WCAG 1.3.3); one sentence per line -->
				<span class="block">Drücken Sie auf <strong class="font-semibold text-ink">Foto erstellen</strong>.</span>
				<span class="block">Ihre Kamera öffnet sich direkt.</span>
			</p>
			<button
				type="button"
				onclick={() => photoCapture?.takePhoto()}
				class="mt-auto flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand text-lg font-semibold text-white shadow-md hover:bg-brand-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
			>
				<span class="material-symbols-rounded text-[24px]" aria-hidden="true">photo_camera</span>
				Foto erstellen
			</button>
		</section>

		<!-- Card: Datei hochladen -->
		<section class="flex flex-col rounded-2xl bg-muted p-5 hc-outline sm:p-6" aria-labelledby="card-upload-title">
			<div class="flex items-start justify-between gap-3">
				<div class="flex items-center gap-3">
					<span class="material-symbols-rounded text-[32px] text-ink" aria-hidden="true">drive_folder_upload</span>
					<h2 id="card-upload-title" class="max-w-[7ch] font-display text-xl font-semibold leading-snug">Datei hochladen</h2>
				</div>
				<span class="rounded-full bg-chip px-2.5 py-1 text-xs font-medium text-ink-soft hc-outline">PDF, JPG</span>
			</div>
			<div class="h-4 shrink-0"></div>
			<button
				type="button"
				onclick={() => photoCapture?.uploadFiles()}
				class="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-control-line bg-muted-strong text-base font-semibold text-ink hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
			>
				<span class="material-symbols-rounded text-[22px]" aria-hidden="true">upload_file</span>
				Foto oder Datei hochladen
			</button>
			<p class="mt-3 text-sm text-ink-soft">Maximal 20 MB</p>
		</section>
		</div>

		<!-- Selected photos + "Erklären" (existing flow) -->
		<div class="mt-4">
			<MultiPhotoCapture bind:this={photoCapture} embedded={true} {onPhotosComplete} {onCancel} />
		</div>

		<!-- 3 steps -->
		<section class="mt-8 sm:mt-12" aria-labelledby="steps-title">
			<p class="text-xs font-bold uppercase tracking-wider text-eyebrow">Ganz einfach</p>
			<h2 id="steps-title" class="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">In 3 Schritten zum leichten Text</h2>
			<p class="mt-1 text-sm text-ink-soft">Schritt für Schritt erklärt</p>

			<!-- Phones: stacked, image below. md–lg: stacked, image beside the text, so each sentence fits on one line.
			     xl: 3 columns. -->
			<ol class="mt-5 grid gap-4 xl:grid-cols-3">
				{#each steps as step (step.number)}
					<li class="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6 md:flex-row md:gap-6 xl:flex-col xl:gap-0">
						<div class="md:flex-1">
							<div class="flex items-center justify-between">
								<span
									class="flex size-10 items-center justify-center rounded-full font-display text-lg font-bold hc-outline {stepColors[step.number - 1]}"
									aria-hidden="true">{step.number}</span
								>
								<span class="material-symbols-rounded text-[28px] text-icon" aria-hidden="true">{step.icon}</span>
							</div>
							<h3 class="mt-4 font-display text-lg font-bold">
								<span class="sr-only">Schritt {step.number}: </span>{step.title}
							</h3>
							<p class="mb-4 mt-1 text-base leading-relaxed text-ink-soft md:mb-0 xl:mb-4">
								{#each step.lines as line (line)}<span class="block">{line}</span>{/each}
							</p>
						</div>
						<img
							src={step.image}
							alt={step.alt}
							class="mt-auto h-28 w-full rounded-lg object-cover sm:h-36 md:mt-0 md:h-auto md:w-72 md:self-stretch lg:w-96 xl:mt-auto xl:h-44 xl:w-full xl:self-auto"
							loading="lazy"
						/>
					</li>
				{/each}
			</ol>
		</section>

		<!-- Help -->
		<section class="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6 md:flex md:items-center md:justify-between md:gap-6" aria-labelledby="help-title">
			<div class="flex items-start gap-4">
				<span class="material-symbols-rounded shrink-0 text-[32px] text-ink" aria-hidden="true">help</span>
				<div>
					<h2 id="help-title" class="font-display text-lg font-bold leading-snug">Brauchen Sie Hilfe bei der Bedienung?</h2>
					<p class="mt-1 text-sm leading-relaxed text-ink-soft">
						Lesen Sie unsere bebilderte Anleitung oder schreiben Sie unserem Team.
					</p>
				</div>
			</div>
			<a
				href={HELP_URL}
				target="_blank"
				rel="noopener"
				class="mt-4 flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-control-line bg-muted-strong px-6 text-base font-semibold text-ink hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand md:mt-0 md:w-auto"
			>
				Zur Anleitung
				<span class="material-symbols-rounded text-[20px]" aria-hidden="true">arrow_forward</span>
			</a>
		</section>
		</div>
	</main>

	<!-- Footer -->
	<footer class="mt-8 border-t border-line bg-muted pb-10 pt-8 sm:mt-12">
		<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-center gap-3">
				<span class="font-display text-xl font-bold">Verainfacher</span>
				<span class="rounded-full bg-mint px-3 py-1 text-sm font-semibold text-ink hc-outline">WCAG AAA Konform</span>
			</div>
			<nav class="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Weitere Informationen">
				{#each [
					{ label: 'Hilfe', href: HELP_URL },
					{ label: 'Datenschutz', href: 'https://kopfhandundfuss.de/datenschutz/' },
					{ label: 'Nutzungsbedingungen', href: 'https://kopfhandundfuss.de/nutzungsbedingungen-verainfacher/' },
					{ label: 'Erklärung zur Barrierefreiheit', href: '#' }
				] as link (link.label)}
					<a
						href={link.href}
						target={link.href === '#' ? undefined : '_blank'}
						rel="noopener"
						class="flex h-11 items-center justify-center rounded-lg border-2 border-control-line bg-surface text-base font-semibold text-ink-soft hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
	</footer>
</div>

<!-- "Nach oben" floating button (camera icon as in the mockup) -->
{#if showScrollTop}
	<button
		type="button"
		onclick={scrollToTop}
		class="fixed bottom-6 right-4 flex sm:right-6 lg:right-8 h-14 items-center gap-2 rounded-2xl bg-brand px-5 font-display text-lg font-semibold text-white shadow-lg hover:bg-brand-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
	>
		<span class="material-symbols-rounded text-[24px]" aria-hidden="true">photo_camera</span>
		Nach oben
	</button>
{/if}

<!-- Drop zone while dragging files (mockup frame 2) -->
{#if isDragging}
	<div class="fixed inset-0 layer-overlay flex items-center justify-center bg-black/80 p-6">
		<button
			type="button"
			onclick={() => { isDragging = false; photoCapture?.uploadFiles() }}
			class="flex w-full max-w-sm flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-6 text-center"
		>
			<span class="flex size-12 items-center justify-center rounded-full bg-muted-strong text-icon" aria-hidden="true">
				<span class="material-symbols-rounded text-[26px]">upload_file</span>
			</span>
			<span class="mt-3 font-display text-lg font-semibold text-ink">Datei hierhin ziehen & ablegen</span>
			<span class="text-base text-ink-soft">oder auf Knopf tippen</span>
		</button>
	</div>
{/if}
