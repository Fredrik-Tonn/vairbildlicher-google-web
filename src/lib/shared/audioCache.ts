interface CachedAudio {
	audioBlob: Blob
	duration: number
	timestamp: number
	mimeType: string
}

class AudioCache {
	private static instance: AudioCache
	private cache = new Map<string, CachedAudio>()
	private readonly maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
	private readonly maxEntries = 50 // Maximum number of cached entries

	static getInstance(): AudioCache {
		if (!AudioCache.instance) {
			AudioCache.instance = new AudioCache()
		}
		return AudioCache.instance
	}

	private generateCacheKey(text: string): string {
		// Simple hash function for cache key
		let hash = 0
		for (let i = 0; i < text.length; i++) {
			const char = text.charCodeAt(i)
			hash = ((hash << 5) - hash) + char
			hash = hash & hash // Convert to 32-bit integer
		}
		return hash.toString()
	}

	private cleanupExpiredEntries(): void {
		const now = Date.now()
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > this.maxAge) {
				this.cache.delete(key)
			}
		}
	}

	private enforceMaxEntries(): void {
		if (this.cache.size > this.maxEntries) {
			// Remove oldest entries
			const entries = Array.from(this.cache.entries())
			entries.sort(([, a], [, b]) => a.timestamp - b.timestamp)
			
			const toRemove = entries.slice(0, this.cache.size - this.maxEntries)
			for (const [key] of toRemove) {
				this.cache.delete(key)
			}
		}
	}

	get(text: string): CachedAudio | null {
		this.cleanupExpiredEntries()
		
		const key = this.generateCacheKey(text)
		const entry = this.cache.get(key)
		
		if (entry && Date.now() - entry.timestamp < this.maxAge) {
			return entry
		}
		
		// Remove expired entry
		if (entry) {
			this.cache.delete(key)
		}
		
		return null
	}

	set(text: string, audioBlob: Blob, mimeType: string): void {
		this.cleanupExpiredEntries()
		this.enforceMaxEntries()
		
		const key = this.generateCacheKey(text)
		
		// Get duration from audio blob (we'll set this when we have the audio element)
		const entry: CachedAudio = {
			audioBlob,
			duration: 0, // Will be updated when audio loads
			timestamp: Date.now(),
			mimeType
		}
		
		this.cache.set(key, entry)
	}

	updateDuration(text: string, duration: number): void {
		const key = this.generateCacheKey(text)
		const entry = this.cache.get(key)
		
		if (entry) {
			entry.duration = duration
			this.cache.set(key, entry)
		}
	}

	clear(): void {
		this.cache.clear()
	}

	getStats(): { size: number, maxEntries: number, maxAge: number } {
		this.cleanupExpiredEntries()
		return {
			size: this.cache.size,
			maxEntries: this.maxEntries,
			maxAge: this.maxAge
		}
	}
}

export const audioCache = AudioCache.getInstance()
