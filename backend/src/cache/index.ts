import Redis from 'ioredis'

export const cache = new Redis({
	host: process.env.REDIS_HOST,
	port: +process.env.REDIS_PORT,
})
