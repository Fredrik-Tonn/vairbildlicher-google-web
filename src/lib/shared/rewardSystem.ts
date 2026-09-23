import type { RewardSystem, RewardEventType, ChatSession, LevelSystem } from './domain/verainfacher.model'
import { REWARD_EVENTS, LEVEL_DEFINITIONS, CHALLENGE_PERFORMANCE_REWARDS } from './domain/verainfacher.model'

class RewardManager {
	private rewardSystem: RewardSystem
	private listeners: Array<(points: number, message: string) => void> = []
	private chatSession: ChatSession = { completionCount: 0, startTime: Date.now(), totalCoins: 0 }

	constructor() {
		this.rewardSystem = {
			totalPoints: 0,
			sessionPoints: 0
		}
	}

	/**
	 * Add points for a specific event
	 */
	addPoints(eventType: RewardEventType, customMessage?: string): number {
		const points = REWARD_EVENTS[eventType]
		this.rewardSystem.totalPoints += points
		this.rewardSystem.sessionPoints += points
		
		const message = customMessage || this.getDefaultMessage(eventType)
		
		// Notify listeners
		this.listeners.forEach(listener => listener(points, message))
		
		console.log(`[RewardSystem] +${points} points for ${eventType}: ${message}`)
		return points
	}

	private getDefaultMessage(eventType: RewardEventType): string {
		const messages: Record<string, string> = {
			CORRECT_ANSWER: 'Richtig! Super gemacht!',
			COMPLETION_SECTION: 'Abschnitt verstanden!',
			FIRST_COMPLETION_BONUS: 'Erster Text! Doppelte Punkte!',
			CHALLENGE_ACCEPTED: 'Wow! Du bist mutig! Das ist schon ein Erfolg!'
		}
		
		return messages[eventType] || 'Gut gemacht!'
	}

	/**
	 * Add listener for point changes
	 */
	onPointsAdded(listener: (points: number, message: string) => void): void {
		this.listeners.push(listener)
	}

	/**
	 * Remove listener
	 */
	removeListener(listener: (points: number, message: string) => void): void {
		const index = this.listeners.indexOf(listener)
		if (index >= 0) {
			this.listeners.splice(index, 1)
		}
	}

	/**
	 * Get total points
	 */
	getTotalPoints(): number {
		return this.rewardSystem.totalPoints
	}

	/**
	 * Get session points
	 */
	getSessionPoints(): number {
		return this.rewardSystem.sessionPoints
	}

	/**
	 * Add points internally without event type
	 */
	private addPointsInternal(points: number, message: string): void {
		this.rewardSystem.totalPoints += points
		this.rewardSystem.sessionPoints += points
		this.chatSession.totalCoins += points
		
		// Notify listeners
		this.listeners.forEach(listener => listener(points, message))
		
		console.log(`[RewardSystem] +${points} points: ${message}`)
	}

	/**
	 * Add points for completion items
	 */
	addCompletionPoints(completionItems: string[]): number {
		const sectionCount = completionItems.length
		const completionIndex = this.chatSession.completionCount
		
		// Abnehmende Punkte: 100%, 90%, 80%, etc. (nur erste 10 Completions)
		let multiplier = 0
		if (completionIndex < 10) {
			multiplier = (100 - (completionIndex * 10)) / 100
		}
		
		// Erste Completion bekommt doppelte Punkte
		if (completionIndex === 0) {
			multiplier *= REWARD_EVENTS.FIRST_COMPLETION_BONUS
		}
		
		const points = Math.round(sectionCount * REWARD_EVENTS.COMPLETION_SECTION * multiplier)
		
		if (points > 0) {
			const message = completionIndex === 0 
				? `Erster Text! ${sectionCount} Abschnitte verstanden!` 
				: `${sectionCount} Abschnitte verstanden!`
			this.addPointsInternal(points, message)
			this.chatSession.completionCount++
		}
		
		return points
	}

	/**
	 * Add challenge performance reward
	 */
	addChallengePerformanceReward(correctAnswers: number, totalQuestions: number): number {
		const performancePoints = CHALLENGE_PERFORMANCE_REWARDS[correctAnswers as keyof typeof CHALLENGE_PERFORMANCE_REWARDS] || 0
		const message = this.getChallengePerformanceMessage(correctAnswers, totalQuestions)
		
		if (performancePoints > 0) {
			this.addPointsInternal(performancePoints, message)
		}
		
		return performancePoints
	}

	/**
	 * Get challenge performance message
	 */
	private getChallengePerformanceMessage(correct: number, total: number): string {
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

	/**
	 * Calculate current level based on total points
	 */
	calculateLevel(): LevelSystem {
		const totalPoints = this.rewardSystem.totalPoints
		
		for (let i = 0; i < LEVEL_DEFINITIONS.length; i++) {
			const level = LEVEL_DEFINITIONS[i]
			if (totalPoints >= level.minPoints && totalPoints <= level.maxPoints) {
				const pointsInLevel = totalPoints - level.minPoints
				const levelRange = level.maxPoints === Infinity ? 200 : (level.maxPoints - level.minPoints + 1)
				const pointsToNext = level.maxPoints === Infinity ? 0 : (level.maxPoints - totalPoints + 1)
				
				return {
					currentLevel: i + 1,
					currentLevelName: level.name,
					currentLevelIcon: level.iconName,
					pointsInCurrentLevel: pointsInLevel,
					pointsToNextLevel: pointsToNext,
					totalPointsForCurrentLevel: levelRange
				}
			}
		}
		
		// Fallback to first level
		const firstLevel = LEVEL_DEFINITIONS[0]
		return {
			currentLevel: 1,
			currentLevelName: firstLevel.name,
			currentLevelIcon: firstLevel.iconName,
			pointsInCurrentLevel: 0,
			pointsToNextLevel: firstLevel.maxPoints + 1,
			totalPointsForCurrentLevel: firstLevel.maxPoints + 1
		}
	}

	/**
	 * Reset chat session (for new chat)
	 */
	resetChatSession(): void {
		// Reset everything for new chat since we don't persist across sessions
		this.rewardSystem = {
			totalPoints: 0,
			sessionPoints: 0
		}
		this.chatSession = { 
			completionCount: 0, 
			startTime: Date.now(), 
			totalCoins: 0 
		}
		console.log('[RewardSystem] Chat session reset - all points cleared')
	}
}

// Singleton instance
export const rewardManager = new RewardManager()
