import { PutFavorite, RemoveFavorite } from '@/controllers/favorite.controller'
import { AuthMiddleware } from '@/middlewares/auth.middleware'
import type { FastifyInstance } from 'fastify'

export const favoriteSchemas = {
	putFavorite: {
		tags: ['favorites'],
		description: 'Add a movie to user favorites',
		params: {
			type: 'object',
			properties: {
				movieId: { type: 'number', description: 'Movie ID' },
			},
			required: ['movieId'],
		},
		response: {
			201: {
				description: 'Movie added to favorites successfully',
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
			404: {
				description: 'Not found',
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
	deleteFavorite: {
		tags: ['favorites'],
		description: 'Remove a movie from user favorites',
		params: {
			type: 'object',
			properties: {
				movieId: { type: 'number', description: 'Movie ID' },
			},
			required: ['movieId'],
		},
		response: {
			200: {
				description: 'Movie removed from favorites successfully',
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			},
			401: {
				description: 'Unauthorized',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
			404: {
				description: 'Not found',
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

export function registerFavoriteRoutes(fastify: FastifyInstance) {
	fastify.put('/:movieId', {
		schema: favoriteSchemas.putFavorite,
		handler: PutFavorite,
		preHandler: AuthMiddleware,
	})

	fastify.delete('/:movieId', {
		schema: favoriteSchemas.deleteFavorite,
		handler: RemoveFavorite,
		preHandler: AuthMiddleware,
	})
}
