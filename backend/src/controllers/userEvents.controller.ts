import { db } from '@/db/index'
import { userEvents } from '@/db/schema/userEvents'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const userEventSchema = z.object({
	movieId: z.number().optional(),
	userEvent: z.enum([
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
	]),
	duration: z.number().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
})

type UserEventBodyType = z.infer<typeof userEventSchema>

export async function createUserEvent(
	req: FastifyRequest<{ Body: UserEventBodyType }>,
	res: FastifyReply
) {
	try {
		const validatedData = userEventSchema.parse(req.body)
		const { movieId, userEvent, duration, metadata } = validatedData

		const user = req.user

		const insertValues: {
			userId: number
			eventType: UserEventType
			movieId?: number
			duration?: number
			metadata?: Record<string, unknown>
		} = {
			userId: user.id,
			eventType: userEvent,
		}

		if (movieId !== undefined) insertValues.movieId = movieId
		if (duration !== undefined) insertValues.duration = duration
		if (metadata !== undefined)
			insertValues.metadata = metadata as Record<string, unknown>

		const result = await db
			.insert(userEvents)
			.values(insertValues)
			.returning({ id: userEvents.id })

		const eventId = result[0]?.id || 0

		return res.code(201).send({
			message: 'User event recorded successfully',
			eventId,
		})
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.code(400).send({
				error: 'Invalid request data',
				details: error.errors,
			})
		}

		req.log.error(error)
		return res.code(500).send({ error: 'Failed to record user event' })
	}
}
