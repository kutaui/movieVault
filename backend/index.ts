import { GoogleCallback, GoogleLogin } from '@/controllers/auth'
import { GetAllMoviesPaginated, GetMovieById } from '@/controllers/movie'
import cookie from '@fastify/cookie'
import Fastify from 'fastify'

const fastify = Fastify({
	logger: true,
})

fastify.register(cookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {},
})

fastify.get('/', async (req, res) => {
	res.send({ hello: 'world' })
})

fastify.get('/auth/google', GoogleLogin)
fastify.get('/google/callback', GoogleCallback)

fastify.get('/movies', GetAllMoviesPaginated)
fastify.get('/movies/:id', GetMovieById)

fastify.listen({ port: 3099 }, (err, address) => {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
})
