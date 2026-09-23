<script lang="ts">
	import {
		ChatFlow,
		ChatHeader,
		type ChatMessage,
		type ImageInfo,
		Infopage,
		InitialImageUpload,
		maxUploadFileCount,
		MultiPhotoCapture,
		SelectImageFiles
	} from '$lib'
	import { onMount, setContext } from 'svelte'
	import type { Challenge } from '$lib/shared/domain/verainfacher.model'
	import ChallengeOverlay from '$lib/ui/modules/ChallengeOverlay.svelte'
	import AIWarningPage from '$lib/ui/modules/AIWarningPage.svelte'
	import LandingPage from '$lib/ui/modules/LandingPage.svelte'
	import AppHeader from '$lib/ui/modules/AppHeader.svelte'
	import { setReadAloudSource } from '$lib/ui/a11y-settings.svelte'
	import { appState } from '$lib/ui/app-state.svelte'
	import { rewardManager } from '$lib/shared/rewardSystem'

	// Receive data from server
	let { data } = $props()

	let chatFlowElem: ChatFlow | undefined = $state()
	let activeModule = $state('initial')
	let inputDisabled = $state(false)
	let chatStarted = $state(false)
	let isDirectSwitch = $state(true) // Default to true for backward compatibility
	
	// AI notice page - shown first on every visit
	let showAIWarning = $state(true)

	let chatRecord = $state([]) as ChatMessage[]
	let images: ImageInfo[] = $state([])
	let pendingImageAction: (() => Promise<void>) | null = $state(null)

	// Challenge state
	let currentChallenge: Challenge | null = $state(null)
	let showChallengeOverlay = $state(false)

	const switchModule = (module: string, direct = true) => {
		isDirectSwitch = direct
		// Only switch module immediately if it's a direct switch
		// For non-direct switches (file upload), we'll keep the current view
		if (direct) {
			activeModule = module
		} else {
			// For non-direct switches, we still need to update the module
			// but the UI will handle displaying both views
			activeModule = module
		}
	}
	setContext('switchModule', { switchModule })

	const removeImage = (idx: number) => {
		if (idx === -1) {
			images = []
		} else {
			images.splice(idx, 1)
		}
	}
	setContext('removeImage', { removeImage })

	const onFilesSelected = (dataURLs: string[]) => {
		// For non-direct switches (upload button), we now switch to chatFlow 
		// within the SelectImageFiles component after files are selected
		if (dataURLs.length > 0) {
			activeModule = 'chatFlow'
		}
		
		const newImages = [...images, ...dataURLs.map(dataURL => ({ src: dataURL, size: 'unknown' }))]
		
		if (newImages.length > maxUploadFileCount) {
			newImages.splice(maxUploadFileCount, Infinity)
			alert(`Es können nicht mehr als ${maxUploadFileCount} Bilder hochgeladen werden.`)
		}
		
		// Set the images first
		images = newImages
		
		// If this is the first image upload, immediately start the chat
		if (!chatStarted && images.length > 0) {
			startChatWithImages(images)
		}
	}
	
	// This creates a function to process images but doesn't execute it immediately
	const startChatWithImages = (uploadedImages: ImageInfo[]) => {
		if (uploadedImages.length === 0) return
		
		activeModule = 'chatFlow'
		inputDisabled = true
		
		// Create a function to process images once the component is ready
		const processImages = async () => {
			if (!chatFlowElem) return
			
			// Send images without a text prompt to get initial summary
			await chatFlowElem.addNewChat('', uploadedImages)
			chatStarted = true
			
			// Clear images as they've been sent
			images = []
			inputDisabled = false
		}
		
		// If component is ready, process now, otherwise store for later
		if (chatFlowElem) {
			processImages()
		} else {
			pendingImageAction = processImages
		}
	}
	
	// When the component mounts or updates, check if we have a pending action
	$effect(() => {
		if (chatFlowElem && pendingImageAction) {
			const action = pendingImageAction
			pendingImageAction = null
			action()
		}
	})

	const onReset = () => {
		chatFlowElem?.clearChat()
		rewardManager.resetChatSession() // Reset chat session for new chat
		chatStarted = false
		activeModule = 'initial'
	}

	const onDone = () => {
		// This can be used for any post-processing after a message is sent
	}

	// Challenge handlers
	const handleChallengeStart = (challenge: Challenge) => {
		currentChallenge = challenge
		showChallengeOverlay = true
	}

	const handleChallengeComplete = (results: { correct: number, total: number, percentage: number }) => {
		showChallengeOverlay = false
		currentChallenge = null
		
		// Call ChatFlow's completion handler
		if (chatFlowElem) {
			chatFlowElem.handleChallengeComplete(results)
		}
	}

	// Handle initial prompt from URL
	onMount(() => {
		if (data?.initialPrompt) {
			// Switch to chat flow
			activeModule = 'chatFlow'
			chatStarted = true
			
			// Wait for ChatFlow component to be ready, then send the prompt
			const sendInitialPrompt = async () => {
				// Small delay to ensure component is fully mounted
				await new Promise(resolve => setTimeout(resolve, 100))
				
				if (chatFlowElem && data.initialPrompt) {
					inputDisabled = true
					await chatFlowElem.addNewChat(data.initialPrompt, [])
					inputDisabled = false
				} else if (data.initialPrompt) {
					// If component not ready, try again
					setTimeout(sendInitialPrompt, 100)
				}
			}
			
			sendInitialPrompt()
		}
	})
	
	// In the chat, "Vorlesen" in the global header reads the latest answer
	$effect(() => {
		if (activeModule === 'chatFlow') return setReadAloudSource(() => appState.completion)
	})

	const handleWarningClose = () => {
		showAIWarning = false
	}
</script>

<!-- div, not main: the global header must stay outside <main> (banner landmark); each view has its own <main> -->
<div class="app-container bg-white">
	<AppHeader />

	<!-- Chat header (coins, level, menu) - only during an active chat, below the global header -->
	{#if chatStarted && activeModule === 'chatFlow' && !showAIWarning}
		<ChatHeader onNewChat={onReset} {inputDisabled} />
	{/if}

	{#if showAIWarning}
		<!-- AI notice as a full page below the global header (was a modal) -->
		<main class="app-content">
			<AIWarningPage onClose={handleWarningClose} />
		</main>
	{:else}
		{#if activeModule === 'initial' && !chatStarted}
			<div class="app-content">
				<LandingPage
					onPhotosComplete={startChatWithImages}
					onCancel={() => switchModule('initial', true)}
				/>
			</div>
		{/if}

		{#if activeModule === 'chatFlow'}
			<!-- Scrollable chat content -->
			<main class="app-content">
				<ChatFlow bind:this={chatFlowElem} user="User" bind:chatRecord={chatRecord} {onDone} bind:inputDisabled={inputDisabled} onChallengeStart={handleChallengeStart} onChallengeComplete={handleChallengeComplete}></ChatFlow>
			</main>
		{:else if activeModule === 'multiPhoto'}
			<div class="app-content">
				<MultiPhotoCapture 
					onPhotosComplete={startChatWithImages} 
					onCancel={() => switchModule('initial', true)}
					showMenu={true}
				/>
			</div>
		{:else if activeModule === 'takePicture'}
			<div class="app-content">
				<SelectImageFiles capturePhoto={true} {onFilesSelected} {isDirectSwitch}></SelectImageFiles>
			</div>
		{:else if activeModule === 'uploadFile' && !isDirectSwitch}
			<!-- For upload button, show both initial screen and hidden file selector -->
			<div class="app-content">
				<div class="flex flex-col h-full">
					<Infopage></Infopage>
					<InitialImageUpload {images} onStartChat={startChatWithImages} {inputDisabled}></InitialImageUpload>
				</div>
			</div>
			<div class="fixed top-0 left-0 w-full h-full z-50 opacity-0">
				<SelectImageFiles capturePhoto={false} {onFilesSelected} {isDirectSwitch}></SelectImageFiles>
			</div>
		{:else if activeModule === 'uploadFile' && isDirectSwitch}
			<!-- Legacy direct switch case -->
			<div class="app-content">
				<SelectImageFiles capturePhoto={false} {onFilesSelected} {isDirectSwitch}></SelectImageFiles>
			</div>
		{/if}
	{/if}
</div>

<!-- Challenge Overlay - Top Level (outside app container) -->
{#if showChallengeOverlay && currentChallenge}
	<ChallengeOverlay 
		challenge={currentChallenge} 
		onComplete={handleChallengeComplete} 
	/>
{/if}


