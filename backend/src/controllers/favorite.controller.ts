import { db } from '@/db/index'
import { favorites } from '@/db/schema/favorite'
import { movies } from '@/db/schema/movie'
import { Pagination } from '@/utils/pagination'
import { and, count, eq, ilike, or } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { users } from '@/db/schema/user'

export async function GetUserAllFavoriteMovies(
	req: FastifyRequest<{
		Querystring: PaginationQueryStringType<{ search: string }>
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

export async function PostUserFavoriteMovie(
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

export async function ToggleFavoritesPublic(
	req: FastifyRequest,
	res: FastifyReply
) {
	const userId = Number.parseInt(req.user.userId)

	try {
		const [userResult] = await db
			.select({ isFavoritesPublic: users.isFavoritesPublic })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)

		if (!userResult) {
			return res.code(404).send({ error: 'User not found' })
		}

		const newPublicStatus = !userResult.isFavoritesPublic

		await db
			.update(users)
			.set({
				isFavoritesPublic: newPublicStatus,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId))

		return res.code(200).send({
			message: 'Favorites visibility updated',
			isPublic: newPublicStatus,
		})
	} catch (error) {
		return res
			.code(500)
			.send({ error: 'Failed to update favorites visibility' })
	}
}

export async function GetUserPublicFavorites(
	req: FastifyRequest<{
		Querystring: PaginationQueryStringType<{ search: string }>
		Params: { userId: number }
	}>,
	res: FastifyReply
) {
	const { page, limit, search } = req.query
	const { userId } = req.params

	try {
		const [userResult] = await db
			.select({ isFavoritesPublic: users.isFavoritesPublic })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)

		if (!userResult) {
			return res.code(404).send({ error: 'User not found' })
		}

		if (!userResult.isFavoritesPublic) {
			return res.code(403).send({ error: "This user's favorites are private" })
		}

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
