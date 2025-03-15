import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger'

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
	mode: 'dynamic',
	openapi: {
		openapi: '3.0.3',
		info: {
			title: 'Movie Vault API',
			version: 'v1',
		},
		tags: [
			{ name: 'auth', description: 'Authentication endpoints' },
			{ name: 'movies', description: 'Movie related endpoints' },
		],
		components: {
			securitySchemes: {
				ApiKeyAuth: {
					type: 'apiKey',
					in: 'header',
					name: 'apiKey',
				},
				CookieAuth: {
					type: 'apiKey',
					in: 'cookie',
					name: 'token',
					description: 'Cookie-based authentication',
				},
			},
		},
		externalDocs: {
			url: 'https://github.com/kutaui/movieVault',
			description: 'Find more info here',
		},
	},
}
