<script lang="ts">
	import DOMPurify from 'dompurify'
	import { fly } from 'svelte/transition'
	import {
		appState,
		chatbotName,
		ChatBubble,
		type ChatMessage,
		DifficultWords,
		type ImageInfo, postFetch,
		type UserChatMessage,
		type VAIRChatMessage,
		waitToSendMessage
	} from '$lib'
	import FollowUpQuestions from '$lib/ui/common/FollowUpQuestions.svelte'
	import { getContext, tick } from 'svelte'
	import { invalidateAll } from '$app/navigation'
	import type { HttpError } from '@sveltejs/kit'
	import { rewardManager } from '$lib/shared/rewardSystem'
	import type { Challenge } from '$lib/shared/domain/verainfacher.model'
	import { downscaleImage } from '$lib/shared/image.client'
	import ChallengeButton from '$lib/ui/common/ChallengeButton.svelte'
	import UserChatBar from './UserChatBar.svelte'

	let { user, chatRecord = $bindable(), onDone, inputDisabled = $bindable(), onChallengeStart = $bindable(), onChallengeComplete = $bindable() }:
		{ user: string, chatRecord: ChatMessage[], onDone: () => void, inputDisabled?: boolean, onChallengeStart?: (challenge: Challenge) => void, onChallengeComplete?: (results: any) => void } = $props()
		
	let lastMessageRef: HTMLDivElement | undefined = $state()
	let followUpQuestionsRef: HTMLDivElement | undefined = $state()
	let answerStartRef: HTMLDivElement | undefined = $state()
	
	const removeImageCtx = getContext<{ removeImage: (idx: number) => void}>('removeImage')

	const addUserChatMessage = (prompt: string, images: string[]) => {
		chatRecord = [...chatRecord, { user, timestamp: Date.now(), prompt, images } as UserChatMessage]
	}

	const addVAIRChatMessage = (timestamp = 0, completion = '', completion_items?: string[]) => {
		chatRecord = [...chatRecord, { user: chatbotName, timestamp, completion, completion_items } as VAIRChatMessage]
	}

	const removeLastMessage = () => chatRecord = chatRecord.slice(0, -1)

	export const clearChat = () => {
		chatRecord = []
		removeImageCtx.removeImage(-1)
		appState.questions = []
		appState.words = []
		appState.availableChallenge = null
		invalidateAll()
	}

	export const addNewChat = async (writtenPrompt: string, imageInfos: ImageInfo[]) => {
		const prompt = DOMPurify.sanitize(writtenPrompt)
		const images = (imageInfos && imageInfos.length > 0)
			? imageInfos.map(imageInfo => imageInfo.src) : []

		addUserChatMessage(prompt, images)
		removeImageCtx.removeImage(-1)
		appState.questions = []
		appState.words = []
		appState.availableChallenge = null

		// Downscale photos while the short send delay runs
		const [uploadImages] = await Promise.all([
			Promise.all(images.map(downscaleImage)),
			new Promise((resolve) => setTimeout(resolve, waitToSendMessage))
		])
		addVAIRChatMessage()
		try {
			const vairResponse = await postFetch('/api/chat', { prompt, images: uploadImages, chatId: appState.chatId })
			if (vairResponse) {
				appState.completion = vairResponse.result.completion
				appState.completion_items = vairResponse.result.completion_items
				appState.chatId = vairResponse.meta.chatId
				removeLastMessage()
				addVAIRChatMessage(Date.now(), appState.completion, appState.completion_items)

				// Award points for completion items
				if (appState.completion_items && appState.completion_items.length > 0) {
					rewardManager.addCompletionPoints(appState.completion_items)
				}

				postFetch('/api/followup-questions', { completion: appState.completion }).then(questions => {
					appState.questions = questions
				})

				postFetch('/api/difficult-words', { completion: appState.completion }).then(words => {
					appState.words = words
				})

				postFetch('/api/multiple-choice-challenge', { chatId: appState.chatId }).then((challenge: Challenge) => {
					if (challenge && challenge.questions && challenge.questions.length > 0) {
						appState.availableChallenge = challenge!
					} else {
						appState.availableChallenge = null
					}
				})

				await tick()
				scrollToLatestContent()
			}
		} catch (err: unknown) {
			removeLastMessage()
			console.log(`Fehler beim Verarbeiten der Anfrage: ${(err as HttpError)?.body?.message || (err as Error)?.message}`)
			addVAIRChatMessage(Date.now(), `Fehler beim Verarbeiten der Anfrage auf dem Server.\nBitte versuchen Sie es später noch einmal.`)
		} finally {
			onDone()
		}
	}
	
	const scrollToLatestContent = () => {
		// Find the scrollable container (.app-content)
		const scrollContainer = document.querySelector('.app-content')
		if (!scrollContainer) return
		
		// Scroll to the beginning of the answer, accounting for header height
		if (answerStartRef) {
			const containerRect = scrollContainer.getBoundingClientRect()
			const elementRect = answerStartRef.getBoundingClientRect()
			
			// Calculate position relative to the container
			const relativeTop = elementRect.top - containerRect.top
			const headerHeight = 60 // Header is 60px on both mobile and desktop
			const additionalOffset = 10 // Small additional offset for better visual spacing
			
			// Calculate scroll position
			const scrollPosition = scrollContainer.scrollTop + relativeTop - headerHeight - additionalOffset
			
			// Scroll the container
			scrollContainer.scrollTo({
				top: scrollPosition,
				behavior: 'smooth'
			})
		} else if (lastMessageRef) {
			// Fallback to last message if answerStartRef is not available
			const containerRect = scrollContainer.getBoundingClientRect()
			const elementRect = lastMessageRef.getBoundingClientRect()
			
			const relativeTop = elementRect.top - containerRect.top
			const isMobile = window.innerWidth < 768
			const headerHeight = 60
			const additionalOffset = isMobile ? 20 : 10 // More offset on mobile for center-like behavior
			
			const scrollPosition = scrollContainer.scrollTop + relativeTop - headerHeight - additionalOffset
			
			scrollContainer.scrollTo({
				top: scrollPosition,
				behavior: 'smooth'
			})
		}
	}

	const handleFollowUpQuestion = (question: string) => {
		appState.questions = []
		addNewChat(question, [])
	}

	const handleDifficultWord = (word: string) => {
		const prompt = `Was bedeutet hier '${word}'?`
		addNewChat(prompt, [])
	}

	const handleSentenceSelect = (prompt: string) => {
		addNewChat(prompt, [])
	}

	/**
	 * Start challenge when user clicks challenge button
	 */
	const handleChallengeStartLocal = () => {
		if (appState.availableChallenge) {
			// Add immediate reward for starting challenge (50 points)
			rewardManager.addPoints('CHALLENGE_ACCEPTED', 'Wow! Du bist mutig! Das ist schon ein Erfolg!')
			
			// Disable input and call parent callback
			if (inputDisabled !== undefined) {
				inputDisabled = true
			}
			
			// Call parent callback to show challenge overlay
			if (onChallengeStart) {
				onChallengeStart(appState.availableChallenge)
			}
		}
	}

	/**
	 * Handle challenge completion - called from parent
	 */
	export const handleChallengeComplete = (results: { correct: number, total: number, percentage: number }) => {
		appState.availableChallenge = null
		
		// Re-enable input
		if (inputDisabled !== undefined) {
			inputDisabled = false
		}
		
		// Call parent callback
		if (onChallengeComplete) {
			onChallengeComplete(results)
		}
		
		console.log('Challenge completed:', results)
	}

	$effect(() => {
		if (chatRecord.length > 0) {
			tick().then(scrollToLatestContent)
		}
	})
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 chat-content">
	<div class="mx-auto max-w-3xl pb-32">
		{#each chatRecord as message, idx}
			<div in:fly={{ x: (message.user === chatbotName) ? -20 : 20, duration: 200, opacity: 0.8 }} class="flex flex-col mb-4">
				{#if idx === chatRecord.length - 1 && message.user === chatbotName}
					<div class="mt-1" bind:this={answerStartRef}></div>
				{/if}
				<ChatBubble {message}
							isLast={idx === chatRecord.length - 1}
							showPlaceholder={message.user === chatbotName && message.timestamp === 0}
							onSentenceSelect={handleSentenceSelect}>
				</ChatBubble>
				
				{#if idx === chatRecord.length - 1 && message.user === chatbotName && appState.questions?.length > 0}
					<div class="mt-10" in:fly={{ y: 3, duration: 150, delay: 50 }} bind:this={followUpQuestionsRef}>
						<FollowUpQuestions 
							questions={appState.questions}
							onSelect={handleFollowUpQuestion} 
						/>
					</div>
				{/if}
				
				{#if idx === chatRecord.length - 1 && message.user === chatbotName}
					{#if appState.words && appState.words.length > 0}
						<div in:fly={{ y: 3, duration: 150, delay: 100 }}>
							<DifficultWords 
								words={appState.words}
								onSelect={handleDifficultWord} 
							/>
						</div>
					{/if}
				{/if}
				
				{#if idx === chatRecord.length - 1}
					<div bind:this={lastMessageRef}></div>
				{/if}
				
				{#if idx === chatRecord.length - 1 && message.user === chatbotName && appState.availableChallenge}
					<div in:fly={{ y: 3, duration: 150, delay: 150 }}>
						<ChallengeButton onChallengeClick={handleChallengeStartLocal} />
					</div>
				{/if}
				
			</div>
		{/each}
		<div class="h-2 pointer-events-none" aria-hidden="true"></div>
		
		<!-- AI content warning at bottom of chat -->
		<UserChatBar />
	</div>
</div>
