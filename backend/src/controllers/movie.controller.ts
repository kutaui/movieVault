import { db } from '@/db/index'
import { genres, movieToGenre, movies } from '@/db/schema/movie'
import { Pagination } from '@/utils/pagination'
import { and, count, eq, ilike, or, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { applyMovieOrdering, getMovieSelectClause } from '@/lib/movie'

export async function GetAllMoviesPaginated(
	req: FastifyRequest<{
		Querystring: PaginationQueryStringType<{ search: string }>
	}>,
	res: FastifyReply
) {
	const { page, limit, search, orderBy = 'rating', order = 'desc' } = req.query
	const offset = (page - 1) * limit

	try {
		const selectClause = getMovieSelectClause()

		let results: MovieType[] = []
		let totalCount = 0

		if (search && search.trim() !== '') {
			const searchTerm = `%${search}%`
			const searchCondition = or(
				ilike(movies.title, searchTerm),
				ilike(movies.description, searchTerm)
			)

			results = (await db
				.select(selectClause)
				.from(movies)
				.where(searchCondition)
				.orderBy(applyMovieOrdering(orderBy, order))
				.limit(limit)
				.offset(offset)) as MovieType[]

			const [countResult] = await db
				.select({ total: count() })
				.from(movies)
				.where(searchCondition)

			if (countResult) {
				totalCount = countResult.total
			}
		} else {
			results = (await db
				.select(selectClause)
				.from(movies)
				.orderBy(applyMovieOrdering(orderBy, order))
				.limit(limit)
				.offset(offset)) as MovieType[]

			const [countResult] = await db.select({ total: count() }).from(movies)

			if (countResult) {
				totalCount = countResult.total
			}
		}

		const pagination = Pagination(page, limit, totalCount)

		return res.send({
			data: results,
			meta: pagination,
		})
	} catch (error) {
		console.error('Error fetching movies:', error)
		return res.status(500).send({ error: 'Failed to fetch movies' })
	}
}

export async function GetMovieById(
	req: FastifyRequest<{ Params: { id: string } }>,
	res: FastifyReply
) {
	const { id } = req.params
	const selectClause = getMovieSelectClause()

	const movie = await db
		.select(selectClause)
		.from(movies)
		.where(eq(movies.id, Number(id)))

	if (!movie) {
		return res.status(404).send({ error: 'Movie not found' })
	}

	return res.send(movie)
}

export async function GetAllMoviesByGenrePaginated(
	req: FastifyRequest<{
		Querystring: PaginationQueryStringType<{ search: string }>
		Params: { genre: number }
	}>,
	res: FastifyReply
) {
	const { page, limit, search, orderBy = 'rating', order = 'desc' } = req.query
	const { genre } = req.params
	const offset = (page - 1) * limit

	try {
		const movieIdsInGenre = await db
			.select({ id: movieToGenre.movieId })
			.from(movieToGenre)
			.where(eq(movieToGenre.genreId, genre))

		if (!movieIdsInGenre || movieIdsInGenre.length === 0) {
			return res.status(404).send({ error: 'No movies found in this genre' })
		}

		const ids = movieIdsInGenre.map((m) => m.id)

		const selectClause = getMovieSelectClause()

		let moviesResult: MovieType[] = []
		let totalCount = 0

		const idsCondition = sql`${movies.id} IN (${ids.join(',')})`

		if (search && search.trim() !== '') {
			const searchTerm = `%${search}%`
			const searchCondition = or(
				ilike(movies.title, searchTerm),
				ilike(movies.description, searchTerm)
			)

			moviesResult = (await db
				.select(selectClause)
				.from(movies)
				.where(and(idsCondition, searchCondition))
				.orderBy(applyMovieOrdering(orderBy, order))
				.limit(limit)
				.offset(offset)) as MovieType[]

			const [countResult] = await db
				.select({ total: count() })
				.from(movies)
				.where(and(idsCondition, searchCondition))

			if (countResult) {
				totalCount = countResult.total
			} else {
				totalCount = 0
			}
		} else {
			moviesResult = (await db
				.select(selectClause)
				.from(movies)
				.where(idsCondition)
				.orderBy(applyMovieOrdering(orderBy, order))
				.limit(limit)
				.offset(offset)) as MovieType[]

			totalCount = ids.length
		}

		if (!moviesResult || moviesResult.length === 0) {
			return res.status(404).send({ error: 'No movies found' })
		}

		const movieIds = moviesResult.map((m: MovieType) => m.id).join(',')
		const movieGenresResult = await db
			.select({
				movieId: movieToGenre.movieId,
				genreId: genres.id,
				genreName: genres.name,
			})
			.from(genres)
			.innerJoin(movieToGenre, eq(genres.id, movieToGenre.genreId))
			.where(sql`${movieToGenre.movieId} IN (${movieIds})`)

		const combinedResults = moviesResult.map((movie: MovieType) => ({
			...movie,
			genres: movieGenresResult
				.filter((mg) => mg.movieId === movie.id)
				.map((mg) => ({ id: mg.genreId, name: mg.genreName })),
		}))

		const pagination = Pagination(page, limit, totalCount)

		return res.send({
			data: combinedResults,
			meta: pagination,
		})
	} catch (error) {
		console.error('Error fetching movies by genre:', error)
		return res.status(500).send({ error: 'Failed to fetch movies by genre' })
	}
}

export async function GetTopMovies(
	req: FastifyRequest<{
		Querystring: {
			limit?: number
		}
	}>,
	res: FastifyReply
) {
	try {
		const limit = req.query.limit || 10

		const topMovies = (await db
			.select(getMovieSelectClause())
			.from(movies)
			.orderBy(applyMovieOrdering('rating', 'desc'))
			.limit(limit)) as MovieType[]

		if (!topMovies || topMovies.length === 0) {
			return res.status(404).send({ error: 'No movies found' })
		}

		return res.send({
			data: topMovies,
		})
	} catch (error) {
		console.error('Error fetching top movies:', error)
		return res.status(500).send({ error: 'Failed to fetch top rated movies' })
	}
}

const movieSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	releaseDate: z.string().min(1, 'Release date is required'),
	rating: z.number().min(0).max(100),
	image: z.string().min(1, 'Image URL is required'),
	trailer: z.string().min(1, 'Trailer URL is required'),
	genres: z.array(z.number()).min(1, 'At least one genre is required'),
})

export async function PostMovie(
	req: FastifyRequest<{ Body: MovieType }>,
	res: FastifyReply
) {
	const movie = movieSchema.parse(req.body)

	const [newMovie] = await db
		.insert(movies)
		.values({
			title: movie.title,
			description: movie.description,
			releaseDate: movie.releaseDate,
			rating: movie.rating,
			image: movie.image,
			trailer: movie.trailer,
		})
		.returning()

	if (!newMovie) {
		return res.status(500).send({ error: 'Failed to create movie' })
	}

	const genreInsert = await db.insert(movieToGenre).values(
		movie.genres.map((genreId) => ({
			movieId: newMovie.id,
			genreId,
		}))
	)

	if (!genreInsert) {
		return res.status(500).send({ error: 'Failed to create movie genres' })
	}

	return res.send(newMovie)
}
