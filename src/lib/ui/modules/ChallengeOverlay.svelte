<script lang="ts">
	import { onMount } from 'svelte'
	import { gsap } from 'gsap'
	import type { Challenge, ChallengeQuestion } from '$lib/shared/domain/verainfacher.model'
	import { shuffleArray } from '$lib/shared/mockChallenge'
	import { rewardManager } from '$lib/shared/rewardSystem'
	import CoinCollectionOverlay from './CoinCollectionOverlay.svelte'

	// Import reward icons
	import MedalIcon from '$lib/ui/assets/MedalIcon.svelte'
	import BadgeIcon from '$lib/ui/assets/BadgeIcon.svelte'
	import TrophyIcon from '$lib/ui/assets/TrophyIcon.svelte'
	import BannerIcon from '$lib/ui/assets/BannerIcon.svelte'
	import GameControllerIcon from '$lib/ui/assets/GameControllerIcon.svelte'

	let { 
		challenge, 
		onComplete 
	}: { 
		challenge: Challenge, 
		onComplete: (results: { correct: number, total: number, percentage: number }) => void 
	} = $props()

	// State management
	let currentQuestionIndex = $state(0)
	let userAnswers: number[] = $state([]) // Store selected answer indices
	let showResults = $state(false)
	let showCoinCollection = $state(false)
	let coinsEarned = $state(0)
	let performanceMessage = $state('')
	let overlayRef: HTMLDivElement | undefined = $state()
	let questionRef: HTMLDivElement | undefined = $state()
	let answersRef: HTMLDivElement | undefined = $state()

	// Shuffle answers for each question to prevent pattern recognition
	let shuffledQuestions: (ChallengeQuestion & { shuffledAnswers: any[], correctIndex: number })[] = $state([])

	// Initialize shuffled questions
	const initializeQuestions = () => {
		shuffledQuestions = challenge.questions.map(question => {
			const answersWithIndex = question.answers.map((answer, index) => ({ ...answer, originalIndex: index }))
			const shuffled = shuffleArray(answersWithIndex)
			const correctIndex = shuffled.findIndex(answer => answer.correct)
			
			return {
				...question,
				shuffledAnswers: shuffled,
				correctIndex
			}
		})
	}

	// Get current question
	const getCurrentQuestion = () => shuffledQuestions[currentQuestionIndex]

	// Select an answer
	const selectAnswer = (answerIndex: number) => {
		// Store the selected answer (no points for attempting anymore)
		userAnswers[currentQuestionIndex] = answerIndex
		
		// Animate selection
		const answerElement = answersRef?.children[answerIndex] as HTMLElement
		if (answerElement) {
			gsap.to(answerElement, {
				scale: 1.02,
				backgroundColor: '#e8f5e8',
				duration: 0.3,
				ease: 'power2.out'
			})
		}
		
		// Move to next question after delay
		setTimeout(() => {
			nextQuestion()
		}, 800)
	}

	// Move to next question
	const nextQuestion = () => {
		if (currentQuestionIndex < shuffledQuestions.length - 1) {
			// Reset answer button styles before moving to next question
			if (answersRef) {
				Array.from(answersRef.children).forEach(child => {
					gsap.set(child, { 
						scale: 1, 
						backgroundColor: '#f9fafb' // bg-gray-50
					})
				})
			}
			
			// Animate out current question
			if (questionRef) {
				gsap.timeline()
					.to(questionRef, { opacity: 0, x: -50, duration: 0.5 })
					.call(() => {
						currentQuestionIndex++
					})
					.to(questionRef, { opacity: 1, x: 0, duration: 0.5 })
					.call(() => {
						// Focus management: Focus first answer button of new question
						setTimeout(() => {
							if (answersRef?.children[0]) {
								(answersRef.children[0] as HTMLElement).focus()
							}
						}, 100)
					})
			} else {
				currentQuestionIndex++
				// Focus management without animation
				setTimeout(() => {
					if (answersRef?.children[0]) {
						(answersRef.children[0] as HTMLElement).focus()
					}
				}, 100)
			}
		} else {
			// Show results
			showResults = true
			calculateResults()
		}
	}

	// Calculate and show results
	const calculateResults = () => {
		let correctCount = 0
		
		// Count correct answers and give points for each
		shuffledQuestions.forEach((question, index) => {
			const selectedAnswerIndex = userAnswers[index]
			if (selectedAnswerIndex === question.correctIndex) {
				correctCount++
				// 100 points per correct answer
				rewardManager.addPoints('CORRECT_ANSWER', 'Richtig! Super!')
			}
		})
		
		const performancePoints = rewardManager.addChallengePerformanceReward(correctCount)
		
		performanceMessage = getPerformanceMessage(correctCount)
		
		coinsEarned = performancePoints + (correctCount * 100) + 50;

		setTimeout(() => {
			animateResults()
			setTimeout(() => {
				showCoinCollection = true
			}, 1000)
		}, 500)
	}

	const getPerformanceMessage = (correct: number): string => {
		if (correct === 0) {
			return "Schön, dass du mitgemacht hast. Leider keine korrekte Antwort. Beim nächsten Mal wirds bestimmt besser."
		} else if (correct === 1) {
			return "Toll, du hast schon 1 richtige Antwort. Aber da geht noch mehr. Versuch es beim nächsten Mal wieder."
		} else if (correct === 2) {
			return "Super, 2 richtige Antworten. Du bist schon fast Experte! Weiter so. Beim nächsten Mal bekommst du vielleicht schon den Pokal."
		} else if (correct === 3) {
			return "Du hast den Pokal gewonnen! Du bist Experte und hast 3 richtige Antworten! Wow!"
		}
		return "Gut gemacht!"
	}

	// Animate results screen
	const animateResults = () => {
		const resultElements = document.querySelectorAll('.result-item')
		gsap.fromTo(resultElements, 
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.5, stagger: 0.2 }
		)
	}

	// Handle coin collection completion
	const handleCoinCollectionComplete = () => {
		showCoinCollection = false
	}

	// Handle keyboard navigation
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			// Allow escape to close modal (but ask for confirmation)
			if (confirm('Möchtest du das Quiz wirklich beenden?')) {
				const correctCount = userAnswers.filter((answer, index) => answer !== undefined && answer === shuffledQuestions[index]?.correctIndex).length
				const total = shuffledQuestions.length
				const percentage = Math.round((correctCount / total) * 100)
				onComplete({ correct: correctCount, total, percentage })
			}
		}
		
		// Focus trap for Tab key
		if (event.key === 'Tab' && overlayRef) {
			const focusableElements = overlayRef.querySelectorAll(
				'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
			const firstElement = focusableElements[0] as HTMLElement
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
			
			if (event.shiftKey) {
				// Tab backwards
				if (document.activeElement === firstElement) {
					lastElement?.focus()
					event.preventDefault()
				}
			} else {
				// Tab forwards
				if (document.activeElement === lastElement) {
					firstElement?.focus()
					event.preventDefault()
				}
			}
		}
	}

	// Initialize on mount
	onMount(() => {
		initializeQuestions()
		
		// Prevent body scrolling when modal is open
		const originalStyle = window.getComputedStyle(document.body).overflow
		document.body.style.overflow = 'hidden'
		
		// Add keyboard listener
		document.addEventListener('keydown', handleKeydown)
		
		// Focus management - focus the modal when it opens
		if (overlayRef) {
			overlayRef.focus()
		}
		
		// Animate overlay entrance
		if (overlayRef) {
			gsap.fromTo(overlayRef, 
				{ opacity: 0, scale: 0.9 },
				{ opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
			)
		}

		// Focus first answer button after initial animation
		setTimeout(() => {
			if (answersRef?.children[0]) {
				(answersRef.children[0] as HTMLElement).focus()
			}
		}, 1000) // After animation completes

		// Cleanup
		return () => {
			document.removeEventListener('keydown', handleKeydown)
			// Restore body scrolling
			document.body.style.overflow = originalStyle
		}
	})
</script>

<!-- Fullscreen Modal Overlay -->
<div 
	bind:this={overlayRef}
	class="fixed inset-0 bg-black bg-opacity-95 z-[99999] flex items-center justify-center p-4 challenge-modal-active"
	style="position: fixed !important; isolation: isolate; pointer-events: auto;"
	role="dialog"
	aria-modal="true"
	aria-labelledby="challenge-title"
	aria-describedby="challenge-description"
	tabindex="-1"
>
	<!-- Screen Reader Live Region for Announcements -->
	<div aria-live="polite" aria-atomic="true" class="sr-only">
		{#if !showResults}
			Frage {currentQuestionIndex + 1} von {shuffledQuestions.length}. {shuffledQuestions[currentQuestionIndex]?.question}
		{:else}
			Quiz abgeschlossen! Ergebnisse werden angezeigt.
		{/if}
	</div>
	
	<div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
		{#if !showResults}
			<!-- Question Phase -->
			<div class="p-8 overflow-y-auto">
				<!-- Header -->
				<div class="text-center mb-8">
					<div class="mb-2 flex justify-center" aria-hidden="true">
						<GameControllerIcon size="48" class="text-gray-700" />
					</div>
					<h1 id="challenge-title" class="text-2xl font-bold text-gray-800">Quiz!</h1>
					<p id="challenge-description" class="text-gray-600">Frage {currentQuestionIndex + 1} von {shuffledQuestions.length}</p>
				</div>
				
				<!-- Progress Bar -->
				<div class="w-full bg-gray-200 rounded-full h-2 mb-8" 
					 role="progressbar" 
					 aria-valuenow={currentQuestionIndex + 1} 
					 aria-valuemin="1" 
					 aria-valuemax={shuffledQuestions.length}
					 aria-label="Quiz Fortschritt: Frage {currentQuestionIndex + 1} von {shuffledQuestions.length}">
					<div 
						class="bg-gray-600 h-2 rounded-full transition-all duration-500"
						style="width: {((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%"
					></div>
				</div>
				
				{#if shuffledQuestions.length > 0}
					{@const currentQ = getCurrentQuestion()}
					
					<!-- Question -->
					<div bind:this={questionRef} class="mb-8">
						<h2 id="current-question" class="text-xl font-semibold text-gray-800 mb-6 text-center">
							{currentQ.question}
						</h2>
						
						<!-- Answers -->
						<fieldset class="space-y-4" aria-labelledby="current-question">
							<legend class="sr-only">Wähle eine Antwort</legend>
							<div bind:this={answersRef} class="space-y-4" role="radiogroup" aria-labelledby="current-question">
								{#each currentQ.shuffledAnswers as answer, index}
									<button
										onclick={() => selectAnswer(index)}
										class="w-full p-6 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-transparent hover:border-gray-300 transition-all duration-200 text-gray-800 focus:ring-4 focus:ring-blue-300 focus:border-blue-500"
										disabled={userAnswers[currentQuestionIndex] !== undefined}
										aria-label="Antwort {String.fromCharCode(65 + index)}: {answer.text}"
										aria-describedby="answer-{index}-desc"
										role="radio"
										aria-checked="false"
									>
										<div class="flex items-center gap-3">
											<div class="w-8 h-8 flex-shrink-0 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-semibold bg-white">
												{String.fromCharCode(65 + index)}
											</div>
											<span class="text-lg flex-1">{answer.text}</span>
										</div>
										<div id="answer-{index}-desc" class="sr-only">
											Drücke Enter oder Leertaste um diese Antwort auszuwählen
										</div>
									</button>
								{/each}
							</div>
						</fieldset>
					</div>
				{/if}
			</div>
		{:else}
			{@const correctCount = userAnswers.filter((answer, index) => answer === shuffledQuestions[index].correctIndex).length}
			<!-- Results Phase - Scrollable Content -->
			<div class="flex-1 overflow-y-auto p-4 sm:p-8 text-center">
				<!-- Performance Message -->
				<div class="mb-6 sm:mb-8">
					{#if correctCount === 0}
						<div class="mb-2 sm:mb-4 flex justify-center" aria-hidden="true">
							<BadgeIcon size="64" class="text-gray-600" />
						</div>
					{:else if correctCount === 1}
						<div class="mb-2 sm:mb-4 flex justify-center" aria-hidden="true">
							<BadgeIcon size="64" class="text-blue-600" />
						</div>
					{:else if correctCount === 2}
						<div class="mb-2 sm:mb-4 flex justify-center" aria-hidden="true">
							<TrophyIcon size="64" class="text-yellow-600" />
						</div>
					{:else if correctCount === 3}
						<div class="mb-2 sm:mb-4 flex justify-center gap-2" aria-hidden="true">
							<TrophyIcon size="64" class="text-yellow-600" />
							<MedalIcon size="64" class="text-yellow-500" />
						</div>
					{:else}
						<div class="mb-2 sm:mb-4 flex justify-center" aria-hidden="true">
							<BannerIcon size="64" class="text-orange-600" />
						</div>
					{/if}
					<h1 id="results-title" class="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">{performanceMessage}</h1>
				</div>
				
				<!-- Detailed Results -->
				<section class="text-left space-y-2 sm:space-y-3 mb-4 sm:mb-8" 
					     aria-labelledby="detailed-results-title">
					<h2 id="detailed-results-title" class="sr-only">Detaillierte Ergebnisse</h2>
					{#each shuffledQuestions as question, index}
						{@const userAnswer = userAnswers[index]}
						{@const isCorrect = userAnswer === question.correctIndex}
						
						<div class="result-item p-3 sm:p-4 rounded-lg {isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border"
							 role="article"
							 aria-label="Frage {index + 1}: {isCorrect ? 'Richtig beantwortet' : 'Falsch beantwortet'}">
							<div class="flex items-start gap-2 sm:gap-3">
								<div class="text-lg sm:text-xl flex-shrink-0" aria-hidden="true">{isCorrect ? '✅' : '❌'}</div>
								<div class="flex-1 min-w-0">
									<div class="font-medium text-gray-800 mb-1 text-sm sm:text-base">Frage {index + 1}: {question.question}</div>
									<div class="text-xs sm:text-sm text-gray-600">
										Deine Antwort: {question.shuffledAnswers[userAnswer]?.text}
									</div>
									{#if !isCorrect}
										<div class="text-xs sm:text-sm text-green-600 mt-1">
											Richtig wäre: {question.shuffledAnswers[question.correctIndex]?.text}
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</section>
			</div>
			
			<!-- Fixed Footer with Continue Button -->
			<div class="flex-shrink-0 p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
				<div class="text-center">
					<button 
						onclick={() => {
							const correctCount = userAnswers.filter((answer, index) => answer === shuffledQuestions[index].correctIndex).length
							const total = shuffledQuestions.length
							const percentage = Math.round((correctCount / total) * 100)
							onComplete({ correct: correctCount, total, percentage })
						}}
						class="bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-900 focus:ring-4 focus:ring-blue-300 transition-colors duration-200 w-full sm:w-auto"
						aria-label="Quiz beenden und zurück zum Chat"
					>
						Weiter
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Coin Collection Animation Overlay -->
{#if showCoinCollection}
	<CoinCollectionOverlay 
		coinsEarned={coinsEarned}
		onComplete={handleCoinCollectionComplete}
	/>
{/if}
