import { genres } from '@/db/schema/movie'
import { db } from '@/db/index'
import { eq } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function GetAllGenres(req: FastifyRequest, res: FastifyReply) {
	const allGenres = await db.select().from(genres)

	if (!allGenres) {
		return res.status(404).send({ error: 'Genres not found' })
	}

	return res.send(allGenres)
}

export async function GetGenreById(
	req: FastifyRequest<{ Params: { id: string } }>,
	res: FastifyReply
) {
	const { id } = req.params
	const [genre] = await db
		.select()
		.from(genres)
		.where(eq(genres.id, Number(id)))

	if (!genre) {
		return res.status(404).send({ error: 'Genre not found' })
	}

	return res.send(genre)
}
