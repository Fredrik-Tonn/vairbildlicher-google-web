<script lang="ts">
	import { ArrowUpTrayMini, CameraMini, Gallery, type ImageInfo } from '$lib'
	import { getContext } from 'svelte'

	let { images = [], onStartChat, inputDisabled }:
		{
			images: ImageInfo[],
			onStartChat: (images: ImageInfo[]) => void,
			inputDisabled: boolean,
		} = $props()

	const switchModuleCtx = getContext<{ switchModule: (module: string, isDirectSwitch?: boolean) => void}>('switchModule')
</script>

<div class="flex flex-col items-center w-full h-full">
	{#if images.length > 0}
		<div class="w-full px-4 mb-6 flex-shrink-0" style="max-height: 30vh;">
			<div class="overflow-y-auto h-full">
				<Gallery {images}></Gallery>
			</div>
		</div>
	{/if}
	
	<div class="flex flex-col items-center justify-center gap-12 px-4 w-full max-w-md mx-auto flex-shrink-0">
		<!-- Camera button - extra large and very prominent with blue circle -->
		<div class="flex flex-col items-center">
			<button 
				type="button" 
				onclick={() => switchModuleCtx.switchModule('multiPhoto', true)}
				aria-label="Foto machen"
				disabled={inputDisabled}
				class="flex items-center justify-center w-44 h-44 bg-blue-500 hover:bg-blue-600 text-white rounded-full focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
			>
				<CameraMini class="size-20"></CameraMini>
			</button>
			<div class="mt-4 px-6 py-2" style="background-color: #f1cb00;">
				<span class="text-lg font-semibold" style="color: #1f2937;">Foto machen</span>
			</div>
		</div>
		
		<!-- Upload button - smaller and secondary -->
		<div class="flex flex-col items-center">
			<button 
				type="button"
				onclick={() => switchModuleCtx.switchModule('uploadFile', false)}
				aria-label="Bild hochladen" 
				disabled={inputDisabled}
				class="flex items-center justify-center w-28 h-28 bg-white text-gray-700 border-2 border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
			>
				<ArrowUpTrayMini class="size-12"></ArrowUpTrayMini>
			</button>
			<div class="mt-3 px-5 py-2" style="background-color: #c94855;">
				<span class="text-base font-semibold text-white">Bild hochladen</span>
			</div>
		</div>
	</div>
</div>
