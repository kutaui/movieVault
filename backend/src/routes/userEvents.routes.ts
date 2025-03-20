import { createUserEvent } from '@/controllers/userEvents.controller'
import { AuthMiddleware } from '@/middlewares/auth.middleware'
import type { FastifyInstance } from 'fastify'

export const userEventsSchemas = {
	postEvent: {
		tags: ['events'],
		description: 'Create a new user event',
		body: {
			type: 'object',
			properties: {
				movieId: { type: 'number' },
				userEvent: {
					type: 'string',
					enum: [
						'HOVER',
						'DETAIL_VIEW',
						'PLAY',
						'PAUSE',
						'STOP',
						'ADD_FAVORITE',
						'REMOVE_FAVORITE',
						'SEARCH',
						'GENRE',
						'SHARE',
						'WATCH_TRAILER',
						'CUSTOM_RECOMMENDATION_CLICK',
					],
				},
				duration: { type: 'number' },
				metadata: { type: 'object' },
			},
			required: ['userEvent'],
		},
		response: {
			201: {
				description: 'Event created successfully',
				type: 'object',
				properties: {
					message: { type: 'string' },
					eventId: { type: 'number' },
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
}

export function registerUserEventsRoutes(fastify: FastifyInstance) {
	fastify.post('/', {
		schema: userEventsSchemas.postEvent,
		handler: createUserEvent,
		preHandler: AuthMiddleware,
	})
}
