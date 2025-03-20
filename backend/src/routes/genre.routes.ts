import { GetAllGenres } from '@/controllers/genre.controller'
import { GetGenreById } from '@/controllers/genre.controller'
import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'

export const genreSchemas = {
	getAllGenres: {
		summary: 'Get all genres',
		description: 'Get all genres',
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						name: { type: 'string' },
					},
				},
			},
		},
	},
	getGenreById: {
		summary: 'Get genre by id',
		description: 'Get genre by id',
		response: {
			200: {
				type: 'object',
				properties: {
					id: { type: 'number' },
					name: { type: 'string' },
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
}

export function registerGenreRoutes(fastify: FastifyInstance) {
	fastify.get('/', {
		schema: genreSchemas.getAllGenres,
		handler: GetAllGenres,
	})
	fastify.get('/:id', {
		schema: genreSchemas.getGenreById,
		handler: GetGenreById,
	})
}
