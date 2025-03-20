import { db } from '@/db/index'
import { favorites } from '@/db/schema/favorite'
import { movies } from '@/db/schema/movie'
import { and, eq } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function PutFavorite(
	req: FastifyRequest<{ Params: { movieId: number } }>,
	res: FastifyReply
) {
	const { movieId } = req.params

	const userId = Number.parseInt(req.user.userId)

	try {
		const movieExists = await db
			.select()
			.from(movies)
			.where(eq(movies.id, movieId))
			.limit(1)

		if (movieExists.length === 0) {
			return res.code(404).send({ error: 'Movie not found' })
		}

		const existingFavorite = await db
			.select()
			.from(favorites)
			.where(and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)))
			.limit(1)

		if (existingFavorite.length > 0) {
			return res.code(400).send({ error: 'Movie already in favorites' })
		}

		await db.insert(favorites).values({
			userId: userId,
			movieId: movieId,
		})

		return res.code(201).send({ message: 'Movie added to favorites' })
	} catch (error) {
		return res.code(500).send({ error: 'Failed to add movie to favorites' })
	}
}

export async function RemoveFavorite(
	req: FastifyRequest<{ Params: { movieId: number } }>,
	res: FastifyReply
) {
	const { movieId } = req.params
	const userId = Number.parseInt(req.user.userId)

	try {
		const result = await db
			.delete(favorites)
			.where(and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)))
			.returning()

		if (result.length === 0) {
			return res.code(404).send({ error: 'Favorite not found' })
		}

		return res.code(200).send({ message: 'Movie removed from favorites' })
	} catch (err) {
		return res
			.code(500)
			.send({ error: 'Failed to remove movie from favorites' })
	}
}
