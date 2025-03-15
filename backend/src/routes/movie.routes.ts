import {
	GetAllMoviesByGenrePaginated,
	GetAllMoviesPaginated,
	GetMovieById,
} from '@/controllers/movie'
import type { FastifyInstance } from 'fastify'

export const movieSchemas = {
	getAllMovies: {
		tags: ['movies'],
		description: 'Get all movies with pagination',
		querystring: {
			type: 'object',
			properties: {
				page: { type: 'integer', default: 1, description: 'Page number' },
				limit: {
					type: 'integer',
					default: 10,
					description: 'Number of items per page',
				},
			},
		},
		response: {
			200: {
				type: 'object',
				properties: {
					data: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: { type: 'integer' },
								title: { type: 'string' },
								description: { type: 'string' },
								releaseDate: { type: 'string', format: 'date' },
								rating: { type: 'integer' },
								image: { type: 'string' },
								trailer: { type: 'string' },
								genres: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											id: { type: 'integer' },
											name: { type: 'string' },
										},
									},
								},
							},
						},
					},
					meta: {
						type: 'object',
						properties: {
							page: { type: 'integer' },
							perPage: { type: 'integer' },
							totalPages: { type: 'integer' },
							currentPage: { type: 'integer' },
							previousPage: { type: 'integer' },
							nextPage: { type: 'integer' },
							isFirstPage: { type: 'boolean' },
							isLastPage: { type: 'boolean' },
						},
					},
				},
			},
		},
	},
	getMovieById: {
		tags: ['movies'],
		description: 'Get a movie by ID',
		params: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'Movie ID' },
			},
			required: ['id'],
		},
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						title: { type: 'string' },
						description: { type: 'string' },
						releaseDate: { type: 'string', format: 'date' },
						rating: { type: 'integer' },
						image: { type: 'string' },
						trailer: { type: 'string' },
						genres: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									id: { type: 'integer' },
									name: { type: 'string' },
								},
							},
						},
						streamingUrls: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									id: { type: 'integer' },
									url: { type: 'string' },
								},
							},
						},
					},
				},
			},
			404: {
				type: 'object',
				properties: {
					error: { type: 'string' },
				},
			},
		},
	},
	getMoviesByGenre: {
		tags: ['movies'],
		description: 'Get all movies by genre with pagination',
		params: {
			type: 'object',
			properties: {
				genre: { type: 'integer', description: 'Genre ID' },
			},
			required: ['genre'],
		},
		querystring: {
			type: 'object',
			properties: {
				page: { type: 'integer', default: 1, description: 'Page number' },
				limit: {
					type: 'integer',
					default: 10,
					description: 'Number of items per page',
				},
			},
		},
		response: {
			200: {
				type: 'object',
				properties: {
					data: { type: 'array' },
				},
			},
		},
	},
}

export function registerMovieRoutes(fastify: FastifyInstance) {
	fastify.get('/movies', {
		schema: movieSchemas.getAllMovies,
		handler: GetAllMoviesPaginated,
	})

	fastify.get('/movies/:id', {
		schema: movieSchemas.getMovieById,
		handler: GetMovieById,
	})

	fastify.get('/movies/genre/:genre', {
		schema: movieSchemas.getMoviesByGenre,
		handler: GetAllMoviesByGenrePaginated,
	})
}
