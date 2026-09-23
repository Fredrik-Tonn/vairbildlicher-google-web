const formatMinSecMsec = (date: Date) =>
	`${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`

export const logDuration = (start: number, label: string, result: string) => {

	console.log(`${label} START: ${formatMinSecMsec(new Date(start))}`)
	console.log(`${label} END: ${formatMinSecMsec(new Date())}`)
	console.log(`${label} DURATION: ${Date.now() - start}ms`)
	console.log(`${label} RESULT:\n${result}\n\n`)
}

export const postFetch = async (path: string, obj: object) => {
	const response = await fetch(path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ ...obj })
	})

	if (!response.ok) {
		throw new Error(`Request failed: ${response.status}`)
	}

	return await response.json()
}

/**
 * Shuffle array elements randomly
 */
export const shuffleArray = <T>(array: T[]): T[] => {
	const shuffled = [...array]
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled
}
