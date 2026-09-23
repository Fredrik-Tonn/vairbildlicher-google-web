export const load = ({ cookies, url }) => {
	cookies.delete('chatId', { path: '/' })
	
	// Extract prompt from URL query parameters
	const prompt = url.searchParams.get('prompt')
	
	return {
		initialPrompt: prompt ? decodeURIComponent(prompt) : null
	}
}
