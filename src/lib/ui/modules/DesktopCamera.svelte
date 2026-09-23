<script lang="ts">
	import { onMount } from 'svelte'
	import { CameraSolid } from '$lib'

	let { onPhotoCapture, onCancel }: { onPhotoCapture: (dataURL: string) => void, onCancel: () => void } = $props()

	let width = $state(640)
	let height = $state(0)
	let streaming = $state(false)
	let cameraStream: MediaStream | undefined = $state()

	let video: HTMLVideoElement | undefined = $state()
	let canvas: HTMLCanvasElement | undefined = $state()

	onMount(() => {
		startCamera()

		return () => stopCamera()
	})

	const oncanplay = () => {
		if (!streaming && video && canvas) {
			height = video.videoHeight / (video.videoWidth / width)

			// Firefox currently has a bug where the height can't be read from
			// the video, so we will make assumptions if this happens.
			if (isNaN(height)) {
				height = width / (4 / 3)
			}
			video.setAttribute('width', String(width))
			video.setAttribute('height', String(height))
			canvas.setAttribute('width', String(width))
			canvas.setAttribute('height', String(height))

			streaming = true
		}
	}

	const clearPhoto = () => {
		if (canvas) {
			const context = canvas.getContext('2d')
			if (context) {
				context.fillStyle = '#AAA'
				context.fillRect(0, 0, canvas.width, canvas.height)
			}
		}
	}

	// Capture a photo by fetching the current contents of the video
	// and drawing it into a canvas, then converting that to a PNG
	// format data URL. By drawing it on an offscreen canvas and then
	// drawing that to the screen, we can change its size and/or apply
	// other changes before drawing it.
	const takePicture = () => {
		if (video && canvas) {
			const context = canvas.getContext('2d')
			if (width && height) {
				canvas.width = width
				canvas.height = height
				if (context) {
					context.drawImage(video, 0, 0, width, height)
					onPhotoCapture(canvas.toDataURL('image/png'))
				}
			} else {
				clearPhoto()
			}
		}
	}

	const startCamera = async () => {
		try {
			if (video) {
				cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
				video.srcObject = cameraStream
				await video.play()
			}
		} catch(err) {
			console.error("Error accessing the camera: ", err);
			alert("Could not access the camera. Please allow permissions and try again.");
			// Return to initial page if camera access fails
			onCancel();
		}
	}

	const stopCamera = () => {
		if (video) {
			video.pause()
			video.src = ''
			video.srcObject = null
		}

		if (cameraStream && cameraStream.active) {
			cameraStream.getTracks().forEach(track => track.stop())
			cameraStream = undefined
		}
	}

	const handleCancel = () => {
		stopCamera()
		onCancel()
	}
</script>

<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl">
		<div class="flex flex-col justify-center items-center">
			<video bind:this={video} {oncanplay} class="w-fit mt-10 mb-10 rounded-2xl">
				<track src="" kind="captions" />
				Video stream not available.
			</video>
			{#if streaming}
				<div class="flex">
					<button type="button" onclick={takePicture}
									class="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
						<div class="flex justify-center items-center gap-2">
							<CameraSolid></CameraSolid>
							Foto machen
						</div>
					</button>
					<button type="button" onclick={handleCancel}
									class="ms-5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
						Abbrechen
					</button>
				</div>
			{/if}
		</div>
		<canvas bind:this={canvas}> </canvas>
	</div>
</div>