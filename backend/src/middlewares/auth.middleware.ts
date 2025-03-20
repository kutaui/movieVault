import { verifyToken } from '@/utils/jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'

type TokenPayload = {
	userId: string
}

export async function AuthMiddleware(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const token = request.cookies.token

	if (!token) {
		return reply.code(401).send({ error: 'Unauthorized' })
	}

	const decodedToken = verifyToken(token) as TokenPayload | null

	if (!decodedToken) {
		return reply.code(401).send({ error: 'Unauthorized' })
	}

	request.user = decodedToken
}
