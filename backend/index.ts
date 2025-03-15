import { swaggerConfig } from '@/config/swagger'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import Fastify from 'fastify'
import { registerAuthRoutes } from '@/routes/auth.routes'
import { registerMovieRoutes } from '@/routes/movie.routes'

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
	routePrefix: '/documentation',
	uiConfig: {
		docExpansion: 'full',
		deepLinking: false,
	},
})

registerAuthRoutes(fastify)
registerMovieRoutes(fastify)

fastify.get('/openapi.json', (req, reply) => {
	reply.send(fastify.swagger())
})

fastify.ready().then(() => {
	fastify.swagger()
	fastify.log.info('Swagger documentation is available at /documentation')
})

fastify.listen({ port: 3099 }, (err, address) => {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
})
