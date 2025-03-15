import { swaggerConfig } from '@/config/swagger'
import { registerAuthRoutes } from '@/routes/auth.routes'
import { registerGenreRoutes } from '@/routes/genre.routes'
import { registerMovieRoutes } from '@/routes/movie.routes'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import Fastify from 'fastify'

const fastify = Fastify({
	logger: true,
})

await fastify.register(cors, {
	origin: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true,
})
await fastify.register(cookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {},
})
await fastify.register(swagger, swaggerConfig)
await fastify.register(swaggerUI, {
	routePrefix: '/',
	uiConfig: {
		docExpansion: 'full',
		deepLinking: false,
	},
})

fastify.register(
	async (fastify) => {
		await fastify.register(
			async (fastify) => {
				await registerAuthRoutes(fastify)
			},
			{ prefix: '/auth' }
		)

		await fastify.register(
			async (fastify) => {
				await registerMovieRoutes(fastify)
			},
			{ prefix: '/movies' }
		)

		await fastify.register(
			async (fastify) => {
				await registerGenreRoutes(fastify)
			},
			{ prefix: '/genres' }
		)
	},
	{ prefix: '/api' }
)

fastify.ready().then(() => {
	fastify.swagger()
})

fastify.listen({ port: Number(process.env.PORT) }, (err, address) => {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
})
