import {
	AddMovieToWatchlist,
	CreateWatchlist,
	DeleteWatchlist,
	GetPublicWatchlist,
	GetUserPublicWatchlists,
	GetUserWatchlists,
	GetWatchlist,
	RemoveMovieFromWatchlist,
	ToggleWatchlistPublic,
	UpdateWatchlist,
} from '@/controllers/watchlist.controller'
import { AuthMiddleware } from '@/middlewares/auth.middleware'
import type { FastifyInstance } from 'fastify'

export const watchlistSchemas = {
	getWatchlists: {
		tags: ['watchlist'],
		description: 'Get all watchlists for the current user',
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
					description: 'Search term to filter watchlists',
				},
			},
		},
		response: {
			200: {
				description: 'List of watchlists',
				type: 'object',
				properties: {
					data: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: { type: 'number' },
								name: { type: 'string' },
								description: { type: 'string' },
								isPublic: { type: 'boolean' },
								createdAt: { type: 'string', format: 'date-time' },
								updatedAt: { type: 'string', format: 'date-time' },
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
		},
	},
	createWatchlist: {
		tags: ['watchlist'],
		description: 'Create a new watchlist',
		body: {
			type: 'object',
			required: ['name'],
			properties: {
				name: { type: 'string' },
				description: { type: 'string' },
				isPublic: { type: 'boolean' },
			},
		},
		response: {
			201: {
				description: 'Watchlist created successfully',
				type: 'object',
				properties: {
					message: { type: 'string' },
					watchlistId: { type: 'number' },
				},
			},
			400: {
				description: 'Invalid request',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	getWatchlist: {
		tags: ['watchlist'],
		description: 'Get a specific watchlist with its items',
		params: {
			type: 'object',
			required: ['watchlistId'],
			properties: {
				watchlistId: { type: 'number' },
			},
		},
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
					description: 'Search term to filter watchlist items',
				},
			},
		},
		response: {
			200: {
				description: 'Watchlist with items',
				type: 'object',
				properties: {
					watchlist: {
						type: 'object',
						properties: {
							id: { type: 'number' },
							name: { type: 'string' },
							description: { type: 'string' },
							isPublic: { type: 'boolean' },
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
						},
					},
					items: {
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
										releaseDate: { type: 'string', format: 'date-time' },
										rating: { type: 'number' },
										image: { type: 'string' },
										trailer: { type: 'string' },
										addedAt: { type: 'string', format: 'date-time' },
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
				},
			},
			404: {
				description: 'Watchlist not found',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	updateWatchlist: {
		tags: ['watchlist'],
		description: 'Update a watchlist',
		params: {
			type: 'object',
			required: ['watchlistId'],
			properties: {
				watchlistId: { type: 'number' },
			},
		},
		body: {
			type: 'object',
			properties: {
				name: { type: 'string' },
				description: { type: 'string' },
				isPublic: { type: 'boolean' },
			},
		},
		response: {
			200: {
				description: 'Watchlist updated successfully',
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			},
			400: {
				description: 'Invalid request',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
			404: {
				description: 'Watchlist not found',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	deleteWatchlist: {
		tags: ['watchlist'],
		description: 'Delete a watchlist',
		params: {
			type: 'object',
			required: ['watchlistId'],
			properties: {
				watchlistId: { type: 'number' },
			},
		},
		response: {
			200: {
				description: 'Watchlist deleted successfully',
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			},
			404: {
				description: 'Watchlist not found',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	addToWatchlist: {
		tags: ['watchlist'],
		description: 'Add a movie to a watchlist',
		params: {
			type: 'object',
			required: ['watchlistId', 'movieId'],
			properties: {
				watchlistId: { type: 'number' },
				movieId: { type: 'number' },
			},
		},
		response: {
			201: {
				description: 'Movie added to watchlist',
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			},
			400: {
				description: 'Movie already in watchlist',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
			404: {
				description: 'Movie or watchlist not found',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	removeFromWatchlist: {
		tags: ['watchlist'],
		description: 'Remove a movie from a watchlist',
		params: {
			type: 'object',
			required: ['watchlistId', 'movieId'],
			properties: {
				watchlistId: { type: 'number' },
				movieId: { type: 'number' },
			},
		},
		response: {
			200: {
				description: 'Movie removed from watchlist',
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			},
			404: {
				description: 'Movie not found in watchlist',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	toggleWatchlistPublic: {
		tags: ['watchlist'],
		description: 'Toggle watchlist public status',
		params: {
			type: 'object',
			required: ['watchlistId'],
			properties: {
				watchlistId: { type: 'number' },
			},
		},
		response: {
			200: {
				description: 'Watchlist visibility updated',
				type: 'object',
				properties: {
					message: { type: 'string' },
					isPublic: { type: 'boolean' },
				},
			},
			404: {
				description: 'Watchlist not found',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	getUserPublicWatchlists: {
		tags: ['watchlist'],
		description: 'Get public watchlists for a user',
		params: {
			type: 'object',
			required: ['userId'],
			properties: {
				userId: { type: 'number' },
			},
		},
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
					description: 'Search term to filter watchlists',
				},
			},
		},
		response: {
			200: {
				description: 'List of watchlists',
				type: 'object',
				properties: {
					data: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: { type: 'number' },
								name: { type: 'string' },
								description: { type: 'string' },
								createdAt: { type: 'string', format: 'date-time' },
								updatedAt: { type: 'string', format: 'date-time' },
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
			404: {
				description: 'User not found',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	getPublicWatchlist: {
		tags: ['watchlist'],
		description: 'Get a public watchlist with its items',
		params: {
			type: 'object',
			required: ['userId', 'watchlistId'],
			properties: {
				userId: { type: 'number' },
				watchlistId: { type: 'number' },
			},
		},
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
					description: 'Search term to filter watchlist items',
				},
			},
		},
		response: {
			200: {
				description: 'Watchlist with items',
				type: 'object',
				properties: {
					watchlist: {
						type: 'object',
						properties: {
							id: { type: 'number' },
							name: { type: 'string' },
							description: { type: 'string' },
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
						},
					},
					items: {
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
										releaseDate: { type: 'string', format: 'date-time' },
										rating: { type: 'number' },
										image: { type: 'string' },
										trailer: { type: 'string' },
										addedAt: { type: 'string', format: 'date-time' },
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
				},
			},
			404: {
				description: 'Watchlist not found or not public',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
}

export function registerWatchlistRoutes(fastify: FastifyInstance) {
	fastify.get('/', {
		schema: watchlistSchemas.getWatchlists,
		handler: GetUserWatchlists,
		preHandler: AuthMiddleware,
	})

	fastify.post('/', {
		schema: watchlistSchemas.createWatchlist,
		handler: CreateWatchlist,
		preHandler: AuthMiddleware,
	})

	fastify.get('/:watchlistId', {
		schema: watchlistSchemas.getWatchlist,
		handler: GetWatchlist,
		preHandler: AuthMiddleware,
	})

	fastify.put('/:watchlistId', {
		schema: watchlistSchemas.updateWatchlist,
		handler: UpdateWatchlist,
		preHandler: AuthMiddleware,
	})

	fastify.delete('/:watchlistId', {
		schema: watchlistSchemas.deleteWatchlist,
		handler: DeleteWatchlist,
		preHandler: AuthMiddleware,
	})

	fastify.put('/:watchlistId/toggle-public', {
		schema: watchlistSchemas.toggleWatchlistPublic,
		handler: ToggleWatchlistPublic,
		preHandler: AuthMiddleware,
	})

	fastify.post('/:watchlistId/movies/:movieId', {
		schema: watchlistSchemas.addToWatchlist,
		handler: AddMovieToWatchlist,
		preHandler: AuthMiddleware,
	})

	fastify.delete('/:watchlistId/movies/:movieId', {
		schema: watchlistSchemas.removeFromWatchlist,
		handler: RemoveMovieFromWatchlist,
		preHandler: AuthMiddleware,
	})

	fastify.get('/public/:userId', {
		schema: watchlistSchemas.getUserPublicWatchlists,
		handler: GetUserPublicWatchlists,
	})

	fastify.get('/public/:userId/:watchlistId', {
		schema: watchlistSchemas.getPublicWatchlist,
		handler: GetPublicWatchlist,
	})
}
