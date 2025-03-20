declare global {
	declare module 'fastify' {
		interface FastifyRequest {
			user: TokenPayload
		}
	}
}
