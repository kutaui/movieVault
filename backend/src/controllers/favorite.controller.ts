import { db } from '@/db/index'
import { favorites } from '@/db/schema/favorite'
import { movies } from '@/db/schema/movie'
import { Pagination } from '@/utils/pagination'
import { and, count, eq, ilike, or } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function GetAllUserFavoriteMovies(
	req: FastifyRequest<{
		Querystring: PaginationQueryString<{ search: string }>
	}>,
	res: FastifyReply
) {
	const { page, limit, search } = req.query
	const userId = Number.parseInt(req.user.userId)

	try {
		if (search && search.trim() !== '') {
			const searchTerm = `%${search}%`
			const whereCondition = and(
				eq(favorites.userId, userId),
				or(
					ilike(movies.title, searchTerm),
					ilike(movies.description, searchTerm)
				)
			)

			const filteredFavorites = await db
				.select({
					id: movies.id,
					title: movies.title,
					description: movies.description,
					releaseDate: movies.releaseDate,
					rating: movies.rating,
					image: movies.image,
					trailer: movies.trailer,
				})
				.from(favorites)
				.innerJoin(movies, eq(movies.id, favorites.movieId))
				.where(whereCondition)
				.limit(limit)
				.offset((page - 1) * limit)

			const [totalResult] = await db
				.select({ total: count() })
				.from(favorites)
				.innerJoin(movies, eq(movies.id, favorites.movieId))
				.where(whereCondition)

			if (!totalResult) {
				return res.code(500).send({ error: 'Failed to fetch total count' })
			}

			const totalCount = totalResult.total
			const pagination = Pagination(page, limit, totalCount)

			return res.code(200).send({
				data: filteredFavorites,
				meta: pagination,
			})
		}

		const favoriteMovies = await db
			.select({
				id: movies.id,
				title: movies.title,
				description: movies.description,
				releaseDate: movies.releaseDate,
				rating: movies.rating,
				image: movies.image,
				trailer: movies.trailer,
			})
			.from(favorites)
			.where(eq(favorites.userId, userId))
			.innerJoin(movies, eq(movies.id, favorites.movieId))
			.limit(limit)
			.offset((page - 1) * limit)

		const [totalResult] = await db
			.select({ total: count() })
			.from(favorites)
			.where(eq(favorites.userId, userId))

		if (!totalResult) {
			return res.code(500).send({ error: 'Failed to fetch total count' })
		}

		const totalCount = totalResult.total
		const pagination = Pagination(page, limit, totalCount)

		return res.code(200).send({
			data: favoriteMovies,
			meta: pagination,
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to retrieve favorite movies' })
	}
}

export async function PutUserFavoriteMovie(
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

export async function DeleteUserFavoriteMovie(
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
