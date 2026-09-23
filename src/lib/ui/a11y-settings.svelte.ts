// Accessibility settings from the header toolbar (text size, contrast).
// Applied as data attributes on <html>; layout.css reacts to them.

const STORAGE_KEY = 'vair:a11y'
export const TEXT_SIZE_STEPS = 3 // 0 = normal, 1 = 112.5 %, 2 = 125 %

type A11ySettings = { textSize: number; highContrast: boolean }

export const a11ySettings = $state<A11ySettings>({ textSize: 0, highContrast: false })

const apply = () => {
	const root = document.documentElement
	root.dataset.textsize = String(a11ySettings.textSize)
	if (a11ySettings.highContrast) root.dataset.contrast = 'high'
	else delete root.dataset.contrast
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(a11ySettings))
	} catch {
		// Storage can be blocked (private mode); settings then last for this visit only
	}
}

export const loadA11ySettings = () => {
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
		if (stored) {
			a11ySettings.textSize = Math.min(Math.max(Number(stored.textSize) || 0, 0), TEXT_SIZE_STEPS - 1)
			a11ySettings.highContrast = Boolean(stored.highContrast)
		}
	} catch {
		// Ignore unreadable storage
	}
	apply()
}

export const cycleTextSize = () => {
	a11ySettings.textSize = (a11ySettings.textSize + 1) % TEXT_SIZE_STEPS
	apply()
}

export const toggleContrast = () => {
	a11ySettings.highContrast = !a11ySettings.highContrast
	apply()
}

// "Vorlesen" in the global header reads whatever the current view registers here
let readAloudSource: (() => string) | null = null

/** Registers the text for "Vorlesen"; returns a function that removes the registration again. */
export const setReadAloudSource = (getText: () => string) => {
	readAloudSource = getText
	return () => {
		if (readAloudSource === getText) readAloudSource = null
	}
}

export const getReadAloudText = () => readAloudSource?.().trim() ?? ''
