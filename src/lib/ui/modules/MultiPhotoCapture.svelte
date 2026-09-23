<script lang="ts">
	import { fly } from 'svelte/transition'
	import { CameraSolid, PhotoSolid, ArrowUpTrayMini, TrashSolid, type ImageInfo } from '$lib'
	import { DesktopCamera } from '$lib'
	import MenuDropdown from '$lib/ui/common/MenuDropdown.svelte'
	import QuestionMarkCircle from '$lib/ui/assets/QuestionMarkCircle.svelte'
	import HelpLink from '$lib/ui/common/HelpLink.svelte'

	let { onPhotosComplete, onCancel, showMenu = false, embedded = false }: {
		onPhotosComplete: (images: ImageInfo[]) => void,
		onCancel: () => void,
		showMenu?: boolean,
		// embedded: the landing page renders its own buttons and calls the exported functions
		embedded?: boolean
	} = $props()

	// State for the 5 photo slots
	let photoSlots = $state<(ImageInfo | null)[]>(Array(5).fill(null))
	let showCamera = $state(false)
	let currentSlotIndex = $state(0)
	let fileInputElement: HTMLInputElement | undefined = $state()
	let cameraInputElement: HTMLInputElement | undefined = $state()

	// Check if we have at least one photo
	const hasPhotos = $derived(photoSlots.some(slot => slot !== null))

	// Find the next available slot
	const getNextAvailableSlot = (): number => {
		return photoSlots.findIndex(slot => slot === null)
	}

	// Check if mobile camera capture is supported
	const isCaptureSupported = () => {
		const input = document.createElement("input");
		input.type = "file";
		return "capture" in input;
	}

	// Handle camera click for photo capture
	const handleCameraClick = (slotIndex?: number) => {
		if (slotIndex !== undefined) {
			// Clicked on a specific slot
			if (photoSlots[slotIndex] !== null) {
				// Slot has photo - delete it
				photoSlots[slotIndex] = null
			} else {
				// Empty slot - take photo
				currentSlotIndex = slotIndex
				triggerCameraCapture()
			}
		} else {
			// Clicked on main camera button - use next available slot
			const nextSlot = getNextAvailableSlot()
			if (nextSlot !== -1) {
				currentSlotIndex = nextSlot
				triggerCameraCapture()
			}
		}
	}

	// Trigger camera capture - mobile first, desktop fallback
	const triggerCameraCapture = () => {
		if (isCaptureSupported()) {
			// Mobile device - use native camera
			cameraInputElement?.click()
		} else {
			// Desktop - use DesktopCamera component
			showCamera = true
		}
	}

	// Entry points for the landing page (embedded mode)
	export const takePhoto = () => handleCameraClick()
	export const uploadFiles = () => handleUploadClick()
	export const addFiles = (files: FileList) => processFiles(files)

	// Handle photo capture from camera
	const handlePhotoCapture = (dataURL: string) => {
		photoSlots[currentSlotIndex] = {
			src: dataURL,
			size: 'unknown'
		}
		showCamera = false
	}

	// Handle camera cancel
	const handleCameraCancel = () => {
		showCamera = false
	}

	// Handle upload button - trigger file selection
	const handleUploadClick = () => {
		const nextSlot = getNextAvailableSlot()
		if (nextSlot !== -1) {
			currentSlotIndex = nextSlot
			fileInputElement?.click()
		}
	}

	// Handle file selection - support multiple files
	const handleFileSelection = (event: Event) => {
		const target = event.target as HTMLInputElement
		const files = target.files
		
		if (files && files.length > 0) {
			processFiles(files)
		}
		
		// Reset file input
		target.value = ''
	}

	// Handle camera input files
	const handleCameraSelection = (event: Event) => {
		const target = event.target as HTMLInputElement
		const files = target.files
		
		if (files && files.length > 0) {
			processFiles(files)
		}
		
		// Reset camera input
		target.value = ''
	}

	// Process multiple files and fill available slots
	const processFiles = (files: FileList) => {
		// Calculate available slots upfront to avoid async issues
		const availableSlots: number[] = []
		for (let i = 0; i < photoSlots.length; i++) {
			if (photoSlots[i] === null) {
				availableSlots.push(i)
			}
		}
		
		const maxFiles = Math.min(files.length, availableSlots.length)
		let filesProcessed = 0
		
		for (let i = 0; i < maxFiles; i++) {
			const file = files[i]
			const slotIndex = availableSlots[i] // Fixed slot assignment
			
			// Check file size (30MB limit)
			if (file.size > 30 * 1024 * 1024) {
				alert(`Datei ${file.name} ist zu groß. Bitte nur Dateien unter 30 MB hochladen.`)
				continue
			}

			// Read file as data URL
			const reader = new FileReader()
			
			reader.onload = (e) => {
				const dataURL = e.target?.result as string
				if (dataURL) {
					photoSlots[slotIndex] = {
						src: dataURL,
						size: 'unknown'
					}
				}
			}
			reader.readAsDataURL(file)
			
			filesProcessed++
		}
		
		if (filesProcessed < files.length) {
			alert(`Nur ${filesProcessed} von ${files.length} Dateien konnten hinzugefügt werden. Maximale Anzahl: 5 Fotos.`)
		}
	}

	// Simplified slot click handler - only delete filled slots
	const handleSlotClick = (slotIndex: number) => {
		if (photoSlots[slotIndex] !== null) {
			// Slot has content - delete it
			photoSlots[slotIndex] = null
		}
		// Empty slots do nothing - only main buttons can fill them
	}

	// Handle explain button
	const handleExplain = () => {
		const validPhotos = photoSlots.filter(slot => slot !== null) as ImageInfo[]
		onPhotosComplete(validPhotos)
	}

	// Handle cancel
	const handleCancel = () => {
		photoSlots = Array(5).fill(null)
		onCancel()
	}
</script>

{#if showCamera}
	<!-- Desktop camera as full-screen overlay (mockup frame 1: tip on black) -->
	<div class="fixed inset-0 layer-overlay bg-black overflow-y-auto" role="dialog" aria-modal="true" aria-label="Kamera">
		<DesktopCamera onPhotoCapture={handlePhotoCapture} onCancel={handleCameraCancel} />
		<p class="mx-auto max-w-sm px-6 pb-10 text-center text-lg leading-relaxed text-[#f4f4f5]">
			Tipp: Halten Sie die Kamera gerade über den Text.
		</p>
	</div>
{/if}
{#if embedded}
	{#if hasPhotos}
		<div class="w-full" transition:fly={{ y: 20, duration: 300 }}>
			{@render photoSlotList()}
		</div>
	{/if}
{:else if !showCamera}
	<div class="flex flex-col items-center justify-center w-full h-full overflow-y-auto py-2 relative">
		<!-- Menu Button - top right corner (only when standalone) -->
		{#if showMenu}
			<div class="absolute top-4 right-4 z-10 inline-flex gap-10">
				<HelpLink></HelpLink>
				<MenuDropdown showNewChat={false} />
			</div>
		{/if}
		
		<!-- Main action buttons -->
		<div class="flex flex-col items-center justify-center gap-4 sm:gap-8 lg:gap-12 px-4 w-full max-w-md mx-auto">
			<!-- Explanatory text -->

			{#if !hasPhotos}
			<div class="text-center px-4 space-y-2 mb-4">
				<p class="text-base sm:text-lg text-gray-700 leading-relaxed">
					Machen Sie ein Foto von dem Text.
				</p>
				<p class="text-base sm:text-lg text-gray-700 leading-relaxed">
					Der Verainfacher hilft beim Verstehen.
				</p>
				<p class="text-base sm:text-lg text-gray-700 leading-relaxed">
					Sie wollen ein Foto machen?
				</p>
				<p class="text-base sm:text-lg text-gray-700 leading-relaxed">
					Dann drücken Sie den Knopf mit dem Kamera-Bild.
				</p>
			</div>
			{/if}
			
			<!-- Main Camera button -->
			<div class="flex flex-col items-center">
				<button 
					type="button" 
					onclick={() => handleCameraClick()}
					aria-label="Foto machen"
					disabled={getNextAvailableSlot() === -1}
					class="flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 bg-blue-500 hover:bg-blue-600 text-white rounded-full focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg drop-shadow-xl"
				>
					<CameraSolid class="size-14 sm:size-18 lg:size-22" />
				</button>
			</div>
			
			<!-- Upload button - hidden but functional -->
			<div class="flex flex-col items-center">
				<button 
					type="button"
					onclick={handleUploadClick}
					aria-label="Bild hochladen"
					disabled={getNextAvailableSlot() === -1}
					class="flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white text-gray-700 border-2 border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
					tabindex="-1"
				>
					<ArrowUpTrayMini class="size-10 sm:size-12 lg:size-14" />
				</button>
				<div class="mt-2 sm:mt-3 px-5 py-2">
					<span class="text-sm sm:text-base font-semibold text-black">Bild hochladen</span>
				</div>
			</div>
		</div>

		<!-- Photo slots - only show after first image -->
		{#if hasPhotos}
			<div class="w-full px-4 mt-4 sm:mt-8 lg:mt-12 pb-4 sm:pb-6" transition:fly={{ y: 20, duration: 300 }}>
				{@render photoSlotList()}
			</div>
		{/if}

	</div>
{/if}

<!-- Hidden inputs, needed in both modes -->
<!-- Hidden file input for uploading multiple files -->
<input 
	type="file" 
	bind:this={fileInputElement}
	onchange={handleFileSelection}
	accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
	multiple
	class="hidden"
	aria-hidden="true"
/>

<!-- Hidden camera input for mobile camera capture -->
<input 
	type="file" 
	bind:this={cameraInputElement}
	onchange={handleCameraSelection}
	accept="image/png, image/jpeg"
	capture="environment"
	class="hidden"
	aria-hidden="true"
/>

{#snippet photoSlotList()}
	<div class="flex justify-center gap-4 mb-6">
		{#each photoSlots as slot, index}
			{#if slot}
				<!-- Filled slot with image preview -->
				<button
					onclick={() => handleSlotClick(index)}
					class="relative w-16 h-16 rounded-lg border-2 border-green-300 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
					aria-label={`Foto ${index + 1} löschen`}
				>
					<!-- Image preview -->
					<img 
						src={slot.src} 
						alt={`Foto ${index + 1}`}
						class="w-full h-full object-cover rounded-md"
					/>
					
					<!-- Trash overlay - proper CSS transparency, always visible -->
					<div class="absolute inset-0 flex items-center justify-center rounded-md z-10" style="background-color: rgba(0, 0, 0, 0.3);">
						<TrashSolid class="size-6 text-white" />
					</div>
					
					<!-- Small badge with checkmark (top right) - above overlay -->
					<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center z-20">
						<svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
				</button>
			{:else}
				<!-- Empty slot (no click handler) -->
				<div class="w-16 h-16 rounded-lg border-2 border-gray-300 flex items-center justify-center bg-gray-50">
					<PhotoSolid class="size-6 text-gray-400" />
				</div>
			{/if}
		{/each}
	</div>

	<!-- Action buttons -->
	<div class="flex gap-4 max-w-md mx-auto">
		<button
			onclick={handleCancel}
			class="flex-1 py-3 px-6 bg-white text-gray-800 border-2 border-control-line rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
		>
			Abbrechen
		</button>
		<button
			onclick={handleExplain}
			class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
		>
			Erklären
		</button>
	</div>
{/snippet}
