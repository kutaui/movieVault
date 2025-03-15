import { GoogleCallback, GoogleLogin } from '@/controllers/auth'
import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'

export const authSchemas = {
	googleLogin: {
		tags: ['auth'],
		description: 'Start Google OAuth flow',
		response: {
			302: {
				description: 'Redirect to Google login',
				type: 'null',
			},
		},
	},
	googleCallback: {
		tags: ['auth'],
		description: 'Google OAuth callback',
		querystring: {
			type: 'object',
			properties: {
				code: { type: 'string', description: 'OAuth authorization code' },
				state: { type: 'string' },
			},
			required: ['code'],
		},
		response: {
			302: {
				description: 'Redirect after successful login',
				type: 'null',
			},
		},
	},
}

export function registerAuthRoutes(
	fastify: FastifyInstance,
	opts?: FastifyRegisterOptions<FastifyInstance>
) {
	fastify.get('/google', {
		schema: authSchemas.googleLogin,
		handler: GoogleLogin,
	})

	fastify.get('/google/callback', {
		schema: authSchemas.googleCallback,
		handler: GoogleCallback,
	})
}
