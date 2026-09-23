import { createClient, type RedisClientType } from 'redis'
import { env } from '$env/dynamic/private'

// In-memory fallback cache when Redis is not configured
class MemoryStorage {
	private store = new Map<string, { value: string; expiresAt?: number }>()

	async get(key: string): Promise<string | null> {
		const item = this.store.get(key)
		if (!item) return null

		if (item.expiresAt && Date.now() > item.expiresAt) {
			this.store.delete(key)
			return null
		}

		return item.value
	}

	async set(key: string, value: string, options?: { EX?: number }): Promise<string> {
		const expiresAt = options?.EX ? Date.now() + options.EX * 1000 : undefined
		this.store.set(key, { value, expiresAt })
		return 'OK'
	}

	async del(key: string): Promise<number> {
		return this.store.delete(key) ? 1 : 0
	}

	get isOpen() {
		return true
	}
}

const memoryClient = new MemoryStorage()

let client: RedisClientType | null = null
let connectPromise: Promise<RedisClientType | MemoryStorage> | null = null

function createRedisClient() {
	if (!env.REDIS_URL) {
		return null
	}

	return createClient({
		url: env.REDIS_URL
	})
}

export async function getRedisClient(): Promise<RedisClientType | MemoryStorage> {
	if (!env.REDIS_URL) {
		return memoryClient
	}

	if (client?.isOpen) return client

	if (!client) {
		const redis = createRedisClient()
		if (!redis) return memoryClient

		client = redis
		client.on('error', (error) => {
			console.warn('Redis client error (falling back to in-memory):', error?.message || error)
		})
	}

	if (!connectPromise) {
		connectPromise = client.connect()
			.then(() => client!)
			.catch((err) => {
				console.warn('Failed to connect to Redis. Using in-memory fallback:', err?.message || err)
				return memoryClient
			})
	}

	try {
		return await connectPromise
	} finally {
		connectPromise = null
	}
}

export async function closeRedisClient() {
	if (client?.isOpen) {
		await client.quit()
	}

	client = null
	connectPromise = null
}
