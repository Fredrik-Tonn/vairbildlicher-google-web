<script lang="ts">
	import { getContext, onMount } from 'svelte'
	import { DesktopCamera } from '$lib'

	let { capturePhoto, onFilesSelected, isDirectSwitch }:
			{ capturePhoto: boolean, onFilesSelected: (dataURLs: string[]) => void, isDirectSwitch: boolean } = $props()

	let files: FileList | undefined = $state()

	let inputFileElement: HTMLInputElement | undefined = $state()

	const switchModuleCtx = getContext<{ switchModule: (module: string, direct?: boolean) => void}>('switchModule')

	const isCaptureSupported = () => {
		const input = document.createElement("input");
		input.type = "file";
		return "capture" in input;
	}

	onMount(() => {
		// Small delay to ensure the DOM is ready
		setTimeout(() => {
			inputFileElement?.click()
		}, 100)
	})

	const onCancel = () => {
		// Return to the initial view if we canceled
		switchModuleCtx.switchModule('initial', true)
	}

	$effect(() => {
		if (files && files.length > 0) {
			let wait = false
			const dataURLs: string[] = []
			const reader = new FileReader()
			reader.addEventListener(
				"load", () => {
					// convert image file to base64 string
					const s = reader.result as string
					dataURLs.push(s)
					wait = false
				}, false
			)
			for (const file of files) {
				if (file.size > 30 * 1024 * 1024) {
					alert(`Datei ${file.name} ist zu groß. Bitte nur Dateien unter 30 MB hochladen.`)
				} else {
					let intervalId = setInterval(() => {
						if (!wait) {
							wait = true
							clearInterval(intervalId)
							reader.readAsDataURL(file)
						}
					}, 300)
				}
			}
			let intervalId = setInterval(() => {
				if (!wait) {
					clearInterval(intervalId)
					files = new DataTransfer().files; // null or undefined does not work
					
					if (dataURLs.length > 0) {
						// Only proceed if we actually have files
						onFilesSelected(dataURLs)
						
						// If this isn't a direct switch module (upload button case),
						// now we can switch to chatFlow since we have files
						if (!isDirectSwitch) {
							switchModuleCtx.switchModule('chatFlow', true)
						}
					} else if (!isDirectSwitch) {
						// If no files were selected in the non-direct case, return to initial
						switchModuleCtx.switchModule('initial', true)
					}
				}
			}, 300)
		} else if (files !== undefined && files.length === 0 && !isDirectSwitch) {
			// If files is defined but empty (user canceled dialog) and it's not a direct switch
			switchModuleCtx.switchModule('initial', true)
		}
	})
</script>

{#if capturePhoto && isCaptureSupported()}
	<input type="file" class="opacity-0" bind:this={inputFileElement} capture="environment"
				 id="pictures" accept="image/png, image/jpeg" multiple bind:files oncancel={onCancel} />
{:else if capturePhoto}
	<DesktopCamera onPhotoCapture={(dataURL) => onFilesSelected([dataURL])} {onCancel}></DesktopCamera>
{:else}
	<input type="file" class="opacity-0 w-full h-full cursor-pointer" bind:this={inputFileElement}
				 id="pictures" accept="image/png, image/jpeg" multiple bind:files oncancel={onCancel} />
{/if}