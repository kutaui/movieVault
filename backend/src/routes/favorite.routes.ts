import {
	DeleteUserFavoriteMovie,
	GetAllUserFavoriteMovies,
	PostUserFavoriteMovie
} from '@/controllers/favorite.controller'
import { AuthMiddleware } from '@/middlewares/auth.middleware'
import type { FastifyInstance } from 'fastify'

export const favoriteSchemas = {
	getFavorites: {
		tags: ['favorites'],
		description: 'Get all favorite movies for the current user',
		querystring: {
			type: 'object',
			properties: {
				page: { type: 'number', default: 1, description: 'Page number' },
				limit: {
					type: 'number',
					default: 10,
					description: 'Number of items per page',
				},
				search: {
					type: 'string',
					description: 'Search term to filter favorites',
				},
			},
		},
		response: {
			200: {
				description: 'List of favorite movies',
				type: 'object',
				properties: {
					data: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: { type: 'number' },
								title: { type: 'string' },
								description: { type: 'string' },
								releaseDate: { type: 'string', format: 'date' },
								rating: { type: 'number' },
								image: { type: 'string' },
								trailer: { type: 'string' },
							},
						},
					},
					meta: {
						type: 'object',
						properties: {
							page: { type: 'number' },
							perPage: { type: 'number' },
							totalPages: { type: 'number' },
							currentPage: { type: 'number' },
							previousPage: { type: 'number' },
							nextPage: { type: 'number' },
							isFirstPage: { type: 'boolean' },
							isLastPage: { type: 'boolean' },
						},
					},
				},
			},
			401: {
				description: 'Unauthorized',
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
	postFavorite: {
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
	fastify.get('/', {
		schema: favoriteSchemas.getFavorites,
		handler: GetAllUserFavoriteMovies,
		preHandler: AuthMiddleware,
	})

	fastify.put('/:movieId', {
		schema: favoriteSchemas.postFavorite,
		handler: PostUserFavoriteMovie,
		preHandler: AuthMiddleware,
	})

	fastify.delete('/:movieId', {
		schema: favoriteSchemas.deleteFavorite,
		handler: DeleteUserFavoriteMovie,
		preHandler: AuthMiddleware,
	})
}
