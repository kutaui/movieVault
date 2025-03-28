import {
	AddComment,
	DeleteComment,
	GetMovieComments,
	GetUserComments,
	UpdateComment,
} from '@/controllers/comment.controller'
import { AuthMiddleware } from '@/middlewares/auth.middleware'
import type { FastifyInstance } from 'fastify'

export const commentSchemas = {
	getMovieComments: {
		tags: ['comments'],
		description: 'Get all comments for a specific movie',
		params: {
			type: 'object',
			properties: {
				movieId: { type: 'number', description: 'Movie ID' },
			},
			required: ['movieId'],
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
					description: 'Search term to filter comments',
				},
			},
		},
		response: {
			200: {
				description: 'List of comments for a movie',
				type: 'object',
				properties: {
					data: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: { type: 'number' },
								content: { type: 'string' },
								createdAt: { type: 'string', format: 'date-time' },
								updatedAt: { type: 'string', format: 'date-time' },
								userId: { type: 'number' },
								userName: { type: 'string' },
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
				description: 'Movie not found',
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
	getUserComments: {
		tags: ['comments'],
		description: 'Get all comments made by the current user',
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
					description: 'Search term to filter comments',
				},
			},
		},
		response: {
			200: {
				description: 'List of user comments',
				type: 'object',
				properties: {
					data: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: { type: 'number' },
								content: { type: 'string' },
								createdAt: { type: 'string', format: 'date-time' },
								updatedAt: { type: 'string', format: 'date-time' },
								movieId: { type: 'number' },
								movieTitle: { type: 'string' },
								movieImage: { type: 'string' },
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
	addComment: {
		tags: ['comments'],
		description: 'Add a comment to a movie',
		params: {
			type: 'object',
			properties: {
				movieId: { type: 'number', description: 'Movie ID' },
			},
			required: ['movieId'],
		},
		body: {
			type: 'object',
			properties: {
				content: { type: 'string', description: 'Comment content' },
			},
			required: ['content'],
		},
		response: {
			201: {
				description: 'Comment added successfully',
				type: 'object',
				properties: {
					message: { type: 'string' },
					comment: {
						type: 'object',
						properties: {
							id: { type: 'number' },
							userId: { type: 'number' },
							movieId: { type: 'number' },
							content: { type: 'string' },
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
							userName: { type: ['string', 'null'] },
						},
					},
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
				description: 'Movie not found',
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
	updateComment: {
		tags: ['comments'],
		description: 'Update a comment',
		params: {
			type: 'object',
			properties: {
				commentId: { type: 'number', description: 'Comment ID' },
			},
			required: ['commentId'],
		},
		body: {
			type: 'object',
			properties: {
				content: { type: 'string', description: 'Updated comment content' },
			},
			required: ['content'],
		},
		response: {
			200: {
				description: 'Comment updated successfully',
				type: 'object',
				properties: {
					message: { type: 'string' },
					comment: {
						type: 'object',
						properties: {
							id: { type: 'number' },
							userId: { type: 'number' },
							movieId: { type: 'number' },
							content: { type: 'string' },
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
						},
					},
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
			403: {
				description: 'Forbidden - User can only update their own comments',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
			404: {
				description: 'Comment not found',
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
	deleteComment: {
		tags: ['comments'],
		description: 'Delete a comment',
		params: {
			type: 'object',
			properties: {
				commentId: { type: 'number', description: 'Comment ID' },
			},
			required: ['commentId'],
		},
		response: {
			200: {
				description: 'Comment deleted successfully',
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
			403: {
				description: 'Forbidden - User can only delete their own comments',
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
			404: {
				description: 'Comment not found',
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

export function registerCommentRoutes(fastify: FastifyInstance) {
	fastify.get('/movie/:movieId', {
		schema: commentSchemas.getMovieComments,
		handler: GetMovieComments,
	})

	fastify.post('/movie/:movieId', {
		schema: commentSchemas.addComment,
		handler: AddComment,
		preHandler: AuthMiddleware,
	})

	fastify.put('/:commentId', {
		schema: commentSchemas.updateComment,
		handler: UpdateComment,
		preHandler: AuthMiddleware,
	})

	fastify.delete('/:commentId', {
		schema: commentSchemas.deleteComment,
		handler: DeleteComment,
		preHandler: AuthMiddleware,
	})
}
