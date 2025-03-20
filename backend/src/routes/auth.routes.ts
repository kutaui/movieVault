import {
	GoogleCallback,
	GoogleLogin,
	Login,
	Register,
} from '@/controllers/auth.controller'
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
	login: {
		tags: ['auth'],
		description: 'Login with email and password',
		body: {
			type: 'object',
			properties: {
				email: { type: 'string', description: 'Email' },
				password: { type: 'string', description: 'Password' },
			},
			required: ['email', 'password'],
		},
		response: {
			200: {
				description: 'User logged in successfully',
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			},
			400: {
				description: 'Bad request',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
			401: {
				description: 'Unauthorized',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	register: {
		tags: ['auth'],
		description: 'Register with email and password',
		body: {
			type: 'object',
			properties: {
				name: { type: 'string', description: 'Name' },
				email: { type: 'string', description: 'Email' },
				password: { type: 'string', description: 'Password' },
			},
			required: ['email', 'password', 'name'],
		},
		response: {
			201: {
				description: 'User created successfully',
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			},
			400: {
				description: 'Bad request',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
			500: {
				description: 'Server error',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
}

export function registerAuthRoutes(fastify: FastifyInstance) {
	fastify.get('/google', {
		schema: authSchemas.googleLogin,
		handler: GoogleLogin,
	})

	fastify.get('/google/callback', {
		schema: authSchemas.googleCallback,
		handler: GoogleCallback,
	})

	fastify.post('/login', {
		schema: authSchemas.login,
		handler: Login,
	})

	fastify.post('/register', {
		schema: authSchemas.register,
		handler: Register,
	})
}
