import { db } from '@/db/index'
import { genres, movieToGenre, movies } from '@/db/schema/movie'
import { Pagination } from '@/utils/pagination'
import { and, count, eq, ilike, or } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function GetAllMoviesPaginated(
	req: FastifyRequest<{
		Querystring: PaginationQueryString<{ search: string }>
	}>,
	res: FastifyReply
) {
	const { page, limit, search } = req.query

	if (search && search.trim() !== '') {
		const searchTerm = `%${search}%`
		const whereCondition = or(
			ilike(movies.title, searchTerm),
			ilike(movies.description, searchTerm)
		)

		const filteredMovies = await db
			.select({
				id: movies.id,
				title: movies.title,
				description: movies.description,
				releaseDate: movies.releaseDate,
				rating: movies.rating,
				image: movies.image,
				trailer: movies.trailer,
			})
			.from(movies)
			.where(whereCondition)
			.limit(limit)
			.offset((page - 1) * limit)

		const [totalResult] = await db
			.select({ total: count() })
			.from(movies)
			.where(whereCondition)

		if (!totalResult) {
			return res.status(500).send({ error: 'Failed to fetch total count' })
		}

		const totalCount = totalResult.total
		const pagination = Pagination(page, limit, totalCount)

		return res.send({
			data: filteredMovies,
			meta: pagination,
		})
	}

	const allMovies = await db
		.select({
			id: movies.id,
			title: movies.title,
			description: movies.description,
			releaseDate: movies.releaseDate,
			rating: movies.rating,
			image: movies.image,
			trailer: movies.trailer,
		})
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
		Querystring: PaginationQueryString<{ search: string }>
		Params: { genre: number }
	}>,
	res: FastifyReply
) {
	const { page, limit, search } = req.query
	const { genre } = req.params

	if (search && search.trim() !== '') {
		const searchTerm = `%${search}%`
		const searchCondition = or(
			ilike(movies.title, searchTerm),
			ilike(movies.description, searchTerm)
		)
		const fullCondition = and(eq(genres.id, genre), searchCondition)

		const filteredMovies = await db
			.select({
				movies: {
					id: movies.id,
					title: movies.title,
					description: movies.description,
					releaseDate: movies.releaseDate,
					rating: movies.rating,
					image: movies.image,
					trailer: movies.trailer,
				},
				genres: {
					id: genres.id,
					name: genres.name,
				},
			})
			.from(movies)
			.innerJoin(movieToGenre, eq(movies.id, movieToGenre.movieId))
			.innerJoin(genres, eq(movieToGenre.genreId, genres.id))
			.where(fullCondition)
			.limit(limit)
			.offset((page - 1) * limit)

		const [totalResult] = await db
			.select({ total: count() })
			.from(movies)
			.innerJoin(movieToGenre, eq(movies.id, movieToGenre.movieId))
			.innerJoin(genres, eq(movieToGenre.genreId, genres.id))
			.where(fullCondition)

		if (!totalResult) {
			return res.status(500).send({ error: 'Failed to fetch total count' })
		}

		const totalCount = totalResult.total

		if (!filteredMovies || filteredMovies.length === 0) {
			return res.status(404).send({ error: 'Movies not found' })
		}

		return res.send({
			data: filteredMovies,
			meta: Pagination(page, limit, totalCount),
		})
	}

	const allMovies = await db
		.select({
			movies: {
				id: movies.id,
				title: movies.title,
				description: movies.description,
				releaseDate: movies.releaseDate,
				rating: movies.rating,
				image: movies.image,
				trailer: movies.trailer,
			},
			genres: {
				id: genres.id,
				name: genres.name,
			},
		})
		.from(movies)
		.innerJoin(movieToGenre, eq(movies.id, movieToGenre.movieId))
		.innerJoin(genres, eq(movieToGenre.genreId, genres.id))
		.where(eq(genres.id, genre))
		.limit(limit)
		.offset((page - 1) * limit)

	const [totalResult] = await db
		.select({ total: count() })
		.from(movies)
		.innerJoin(movieToGenre, eq(movies.id, movieToGenre.movieId))
		.where(eq(movieToGenre.genreId, genre))

	if (!totalResult) {
		return res.status(500).send({ error: 'Failed to fetch total count' })
	}

	const totalCount = totalResult.total

	if (!allMovies || allMovies.length === 0) {
		return res.status(404).send({ error: 'Movies not found' })
	}

	return res.send({
		data: allMovies,
		meta: Pagination(page, limit, totalCount),
	})
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
	req: FastifyRequest<{ Body: Movie }>,
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
