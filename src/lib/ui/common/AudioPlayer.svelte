<script lang="ts">
	import { onMount } from 'svelte'

	let { audioBlob, autoPlay = false }: { audioBlob: Blob, autoPlay?: boolean } = $props()

	let audioElement: HTMLAudioElement | undefined = $state()
	let canvasElement: HTMLCanvasElement | undefined = $state()
	let isPlaying = $state(false)
	let currentTime = $state(0)
	let duration = $state(0)
	let isLoaded = $state(false)
	let waveformData: number[] = $state([])
	let isDragging = $state(false)

	const formatTime = (time: number): string => {
		if (!isFinite(time) || isNaN(time)) return '0:00'
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
	}

	let audioUrl = $derived(URL.createObjectURL(audioBlob))
	let progressPercent = $derived(duration > 0 ? (currentTime / duration) * 100 : 0)
	let currentTimeFormatted = $derived(formatTime(currentTime))
	let durationFormatted = $derived(formatTime(duration))

	const generateWaveform = async (audioBuffer: AudioBuffer) => {
		const channelData = audioBuffer.getChannelData(0) // Use first channel
		const samples = 50 // Number of bars in waveform
		const blockSize = Math.floor(channelData.length / samples)
		const waveform: number[] = []

		for (let i = 0; i < samples; i++) {
			let sum = 0
			for (let j = 0; j < blockSize; j++) {
				sum += Math.abs(channelData[i * blockSize + j])
			}
			waveform.push(sum / blockSize)
		}

		// Normalize to 0-1 range with minimum amplitude for silent parts
		const max = Math.max(...waveform)
		const minAmplitude = 0.05 // Small dots for silence
		
		return waveform.map(val => {
			const normalized = max > 0 ? val / max : 0
			return Math.max(normalized, minAmplitude) // Ensure minimum height
		})
	}

	const drawWaveform = () => {
		if (!canvasElement || waveformData.length === 0) return

		const ctx = canvasElement.getContext('2d')
		if (!ctx) return

		const width = canvasElement.width
		const height = canvasElement.height
		const barWidth = width / waveformData.length
		const progressBarCount = Math.floor((progressPercent / 100) * waveformData.length)

		ctx.clearRect(0, 0, width, height)

		waveformData.forEach((amplitude, index) => {
			const barHeight = amplitude * height * 0.8 // Leave some margin
			const x = index * barWidth
			const y = (height - barHeight) / 2

			// Color bars based on progress - using blue theme
			ctx.fillStyle = index < progressBarCount ? '#6366f1' : '#d1d5db'
			ctx.fillRect(x, y, barWidth - 1, barHeight)
		})
	}

	const togglePlayPause = () => {
		if (!audioElement) return

		if (isPlaying) {
			audioElement.pause()
		} else {
			audioElement.play()
		}
	}

	let dragUpdateFrame: number | null = null
	
	const updateTimeFromMouse = (event: MouseEvent) => {
		if (!audioElement || !canvasElement || !isLoaded) return

		const rect = canvasElement.getBoundingClientRect()
		const clickX = event.clientX - rect.left
		const progressRatio = Math.max(0, Math.min(1, clickX / rect.width))
		const newTime = progressRatio * duration

		// Smooth update using requestAnimationFrame for dragging
		if (isDragging && dragUpdateFrame) {
			cancelAnimationFrame(dragUpdateFrame)
		}

		const updateTime = () => {
			if (audioElement) {
				audioElement.currentTime = newTime
				currentTime = newTime // Update immediately for visual feedback
			}
		}

		if (isDragging) {
			dragUpdateFrame = requestAnimationFrame(updateTime)
		} else {
			updateTime()
		}
	}

	const handleCanvasClick = (event: MouseEvent) => {
		if (!isDragging) { // Only handle click if not dragging
			updateTimeFromMouse(event)
		}
	}

	const handleMouseDown = (event: MouseEvent) => {
		isDragging = true
		updateTimeFromMouse(event)
		event.preventDefault()
	}

	const handleMouseMove = (event: MouseEvent) => {
		if (isDragging) {
			updateTimeFromMouse(event)
		}
	}

	const handleMouseUp = () => {
		isDragging = false
		if (dragUpdateFrame) {
			cancelAnimationFrame(dragUpdateFrame)
			dragUpdateFrame = null
		}
	}

	const handleTouchStart = (event: TouchEvent) => {
		isDragging = true
		const touch = event.touches[0]
		const mouseEvent = new MouseEvent('mousedown', {
			clientX: touch.clientX,
			clientY: touch.clientY
		})
		updateTimeFromMouse(mouseEvent)
		event.preventDefault()
	}

	const handleTouchMove = (event: TouchEvent) => {
		if (isDragging) {
			const touch = event.touches[0]
			const mouseEvent = new MouseEvent('mousemove', {
				clientX: touch.clientX,
				clientY: touch.clientY
			})
			updateTimeFromMouse(mouseEvent)
		}
	}

	const handleTouchEnd = () => {
		isDragging = false
	}

	onMount(() => {
		if (!audioElement) return

		const loadAudio = async () => {
			try {
				// Load audio for waveform analysis
				const arrayBuffer = await audioBlob.arrayBuffer()
				const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
				const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
				
				waveformData = await generateWaveform(audioBuffer)
				
				// Set up audio element
				audioElement!.src = audioUrl
				audioElement!.preload = 'metadata'
				
			} catch (error) {
				console.error('Error loading audio:', error)
			}
		}

		const handleLoadedMetadata = () => {
			duration = audioElement!.duration || 0
			isLoaded = true
			
			if (autoPlay) {
				audioElement!.play().catch(console.error)
			}
		}

		const handleTimeUpdate = () => {
			if (!isDragging) { // Don't update time while dragging
				currentTime = audioElement!.currentTime
			}
		}

		const handlePlay = () => {
			isPlaying = true
		}

		const handlePause = () => {
			isPlaying = false
		}

		const handleEnded = () => {
			isPlaying = false
			currentTime = 0
		}

		// Add event listeners
		audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)
		audioElement.addEventListener('timeupdate', handleTimeUpdate)
		audioElement.addEventListener('play', handlePlay)
		audioElement.addEventListener('pause', handlePause)
		audioElement.addEventListener('ended', handleEnded)

		// Global mouse events for dragging
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)

		loadAudio()

		return () => {
			if (audioElement) {
				audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
				audioElement.removeEventListener('timeupdate', handleTimeUpdate)
				audioElement.removeEventListener('play', handlePlay)
				audioElement.removeEventListener('pause', handlePause)
				audioElement.removeEventListener('ended', handleEnded)
			}
			
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
			URL.revokeObjectURL(audioUrl)
		}
	})

	// Redraw waveform when progress changes
	$effect(() => {
		if (isLoaded && waveformData.length > 0) {
			drawWaveform()
		}
	})
</script>

<div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
	<!-- Play/Pause Button -->
	<button
		class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 disabled:bg-gray-400"
		onclick={togglePlayPause}
		disabled={!isLoaded}
	>
		{#if isPlaying}
			<!-- Pause Icon -->
			<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
				<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
			</svg>
		{:else}
			<!-- Play Icon -->
			<svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M8 5v14l11-7z"/>
			</svg>
		{/if}
	</button>

	<!-- Waveform Visualization -->
	<div class="flex-1">
		<canvas
			bind:this={canvasElement}
			width="300"
			height="40"
			class="w-full h-10 {isDragging ? 'cursor-grabbing' : 'cursor-pointer'} select-none"
			onclick={handleCanvasClick}
			onmousedown={handleMouseDown}
			ontouchstart={handleTouchStart}
			ontouchmove={handleTouchMove}
			ontouchend={handleTouchEnd}
		></canvas>
	</div>

	<!-- Time Display -->
	<div class="text-xs text-gray-600 dark:text-gray-400 font-mono min-w-[4rem] text-right">
		{currentTimeFormatted} / {durationFormatted}
	</div>
</div>

<!-- Hidden Audio Element -->
<audio bind:this={audioElement} preload="metadata"></audio>
