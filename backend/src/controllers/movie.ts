import { db } from '@/db/index'
import { genres, movieGenres, movies } from '@/db/schema/movie'
import { Pagination } from '@/utils/pagination'
import { count, eq } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function GetAllMoviesPaginated(
	req: FastifyRequest<{ Querystring: PaginationQueryString }>,
	res: FastifyReply
) {
	const { page, limit } = req.query
	const allMovies = await db
		.select()
		.from(movies)
		.limit(limit)
		.offset((page - 1) * limit)
	const [totalResult] = await db.select({ total: count() }).from(movies)

	if (!totalResult) {
		return res.status(500).send({ error: 'Failed to fetch total count' })
	}

	const totalCount = totalResult.total
	const pagination = Pagination(page, limit, totalCount)

	return res.send({
		data: allMovies,
		meta: pagination,
	})
}

export async function GetMovieById(
	req: FastifyRequest<{ Params: { id: string } }>,
	res: FastifyReply
) {
	const { id } = req.params
	const movie = await db
		.select()
		.from(movies)
		.where(eq(movies.id, Number(id)))

	if (!movie) {
		return res.status(404).send({ error: 'Movie not found' })
	}

	return res.send(movie)
}

export async function GetAllMoviesByGenrePaginated(
	req: FastifyRequest<{
		Querystring: PaginationQueryString
		Params: { genre: number }
	}>,
	res: FastifyReply
) {
	const { page, limit } = req.query
	const { genre } = req.params

	const allMovies = await db
		.select()
		.from(movies)
		.innerJoin(movieGenres, eq(movies.id, movieGenres.movieId))
		.innerJoin(genres, eq(movieGenres.genreId, genres.id))
		.where(eq(genres.id, genre))
		.limit(limit)
		.offset((page - 1) * limit)

	if (!allMovies) {
		return res.status(404).send({ error: 'Movies not found' })
	}

	return res.send(allMovies)
}
