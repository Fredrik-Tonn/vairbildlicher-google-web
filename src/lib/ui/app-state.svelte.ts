import type { Challenge } from '$lib'

class AppState {
	completion = $state('')
	completion_items = $state([])
	chatId = $state('')

	questions = $state([])
	words = $state([])
	availableChallenge: Challenge | null = $state(null)
}

export const appState = new AppState()
