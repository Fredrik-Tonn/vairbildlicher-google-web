export type FunctionType = 'ask' | 'rant'

export type VAIRRequest = {
	function: FunctionType
	parameters: {
		prompt?: string
		images?: string[]
	}
	meta?: {
		chatid?: string
	}
}

export type VAIRResponse = {
	result: {
		completion: string
		completion_items?: string[]
		questions: string[]
		words: string[]
		challenge?: Challenge
	}
	meta: {
		chatid: string
	}
}

/*
 * ChatMessage is a closed type, thus defined as 'type ChatMessage'
 * Extensions of type ChatMessage should be defined as interfaces
 * to allow declaration merging
 */
export type ChatMessage = {
	user: string
	timestamp: number
}

export interface VAIRChatMessage extends ChatMessage {
	completion: string
	completion_items?: string[]
}

export interface UserChatMessage extends ChatMessage {
	prompt?: string
	images?: string[]
}

export type ImageInfo = {
	src: string
	size: string
}

// Challenge System Types
export interface Challenge {
	type: 'multiplechoice'
	questions: ChallengeQuestion[]
}

export interface ChallengeQuestion {
	question: string
	answers: ChallengeAnswer[]
}

export interface ChallengeAnswer {
	text: string
	correct: boolean
}

// Reward System Types
export interface RewardSystem {
	totalPoints: number
	sessionPoints: number
}


// Challenge State Management
export interface ChallengeState {
	isActive: boolean
	currentQuestionIndex: number
	userAnswers: boolean[]
	showResults: boolean
	challengeData: Challenge | null
	startTime: number
}

// Chat Session Types
export interface ChatSession {
	completionCount: number
	startTime: number
	totalCoins: number
}

// Level System Types
export interface LevelSystem {
	currentLevel: number
	currentLevelName: string
	currentLevelIcon: string
	pointsInCurrentLevel: number
	pointsToNextLevel: number
	totalPointsForCurrentLevel: number
}

// Level Definitions
// Role names and phosphor icons as in einfachfuturium-web (replaced the animal names Maus … Säbelzahntiger)
export const LEVEL_DEFINITIONS = [
	{ name: 'Entdecker', iconName: 'BackpackIcon', minPoints: 0, maxPoints: 199 },
	{ name: 'Sammler', iconName: 'BasketIcon', minPoints: 200, maxPoints: 399 },
	{ name: 'Chronist', iconName: 'NotepadIcon', minPoints: 400, maxPoints: 599 },
	{ name: 'Forscher', iconName: 'MagnifyingGlassIcon', minPoints: 600, maxPoints: 799 },
	{ name: 'Wissenschaftler', iconName: 'AtomIcon', minPoints: 800, maxPoints: 999 },
	{ name: 'Visionär', iconName: 'LightbulbFilamentIcon', minPoints: 1000, maxPoints: 1199 },
	{ name: 'Zukunftsforscher', iconName: 'RocketLaunchIcon', minPoints: 1200, maxPoints: Infinity }
] as const

// Reward Events - Only actively used events
export const REWARD_EVENTS = {
	// Completion-based points
	COMPLETION_SECTION: 10,        // Per section in completion_items
	FIRST_COMPLETION_BONUS: 2,     // Multiplier for first completion
	
	// Challenge points
	CHALLENGE_ACCEPTED: 50,        // When challenge is started
	CORRECT_ANSWER: 100           // Per correct answer
} as const

// Performance-based Challenge rewards
export const CHALLENGE_PERFORMANCE_REWARDS = {
	0: 10,  // 0 correct answers
	1: 20,  // 1 correct answer  
	2: 50,  // 2 correct answers
	3: 80   // 3 correct answers
} as const

export type RewardEventType = keyof typeof REWARD_EVENTS
