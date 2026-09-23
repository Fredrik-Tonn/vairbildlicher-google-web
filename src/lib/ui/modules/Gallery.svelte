<script lang="ts">
	import type { ImageInfo } from '$lib'
	import { getContext } from 'svelte'

	let { images }: { images: ImageInfo[] } = $props()

	let imageIdx = $state(-1)

	const removeImageCtx = getContext<{ removeImage: (idx: number) => void}>('removeImage')
</script>

<div class="grid justify-items-center gap-4">
	{#if imageIdx > -1}
		<button onclick={() => imageIdx = -1} class="m-3">
			<img
				class="max-h-100 h-auto max-w-full rounded-lg shadow-xl"
				src={images[imageIdx].src}
				alt={`Das ${imageIdx + 1}. hochgeladene Bild.`}
			/>
		</button>
	{/if}
	<div class="flex justify-center gap-4">
		{#each images as image, idx}
			<button onclick={() => imageIdx = (imageIdx === idx) ? -1 : idx} class="relative m-3">
				<img
					class="max-h-20 h-auto max-w-full rounded-lg shadow-xl hover:outline hover:outline-primary-500"
					src={image.src}
					alt={`Das ${idx + 1}. hochgeladene Bild.`}
				/>
				<a href="/" onclick={() => removeImageCtx.removeImage(idx)} class="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-white border-1 border-stone-300 rounded-full -top-2 -end-2 dark:border-gray-900">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-stone-500 hover:text-red-500">
							<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
						</svg>
						<span class="sr-only">Das ${idx + 1}. Bild entfernen</span>
				</a>
			</button>
		{/each}
	</div>
</div>
