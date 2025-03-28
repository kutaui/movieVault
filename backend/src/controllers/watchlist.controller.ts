import { db } from '@/db/index'
import { watchlists, watchlistItems } from '@/db/schema/watchlist'
import { movies } from '@/db/schema/movie'
import { Pagination } from '@/utils/pagination'
import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { users } from '@/db/schema/user'

export async function GetUserWatchlists(
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
				eq(watchlists.userId, userId),
				or(
					ilike(watchlists.name, searchTerm),
					ilike(watchlists.description, searchTerm)
				)
			)

			const filteredWatchlists = await db
				.select({
					id: watchlists.id,
					name: watchlists.name,
					description: watchlists.description,
					isPublic: watchlists.isPublic,
					createdAt: watchlists.createdAt,
					updatedAt: watchlists.updatedAt,
				})
				.from(watchlists)
				.where(whereCondition)
				.orderBy(desc(watchlists.updatedAt))
				.limit(limit)
				.offset((page - 1) * limit)

			const [totalResult] = await db
				.select({ total: count() })
				.from(watchlists)
				.where(whereCondition)

			if (!totalResult) {
				return res.code(500).send({ error: 'Failed to fetch total count' })
			}

			const totalCount = totalResult.total
			const pagination = Pagination(page, limit, totalCount)

			return res.code(200).send({
				data: filteredWatchlists,
				meta: pagination,
			})
		}

		const userWatchlists = await db
			.select({
				id: watchlists.id,
				name: watchlists.name,
				description: watchlists.description,
				isPublic: watchlists.isPublic,
				createdAt: watchlists.createdAt,
				updatedAt: watchlists.updatedAt,
			})
			.from(watchlists)
			.where(eq(watchlists.userId, userId))
			.orderBy(desc(watchlists.updatedAt))
			.limit(limit)
			.offset((page - 1) * limit)

		const [totalResult] = await db
			.select({ total: count() })
			.from(watchlists)
			.where(eq(watchlists.userId, userId))

		if (!totalResult) {
			return res.code(500).send({ error: 'Failed to fetch total count' })
		}

		const totalCount = totalResult.total
		const pagination = Pagination(page, limit, totalCount)

		return res.code(200).send({
			data: userWatchlists,
			meta: pagination,
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to retrieve watchlists' })
	}
}

export async function CreateWatchlist(
	req: FastifyRequest<{
		Body: { name: string; description?: string; isPublic?: boolean }
	}>,
	res: FastifyReply
) {
	const { name, description, isPublic } = req.body
	const userId = Number.parseInt(req.user.userId)

	try {
		if (!name || name.trim() === '') {
			return res.code(400).send({ error: 'Watchlist name is required' })
		}

		const result = await db
			.insert(watchlists)
			.values({
				name: name.trim(),
				description: description?.trim(),
				isPublic: isPublic ?? false,
				userId,
				updatedAt: new Date(),
			})
			.returning({ id: watchlists.id })

		if (!result || result.length === 0 || !result[0]) {
			return res.code(500).send({ error: 'Failed to create watchlist' })
		}

		return res.code(201).send({
			message: 'Watchlist created successfully',
			watchlistId: result[0].id,
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to create watchlist' })
	}
}

export async function DeleteWatchlist(
	req: FastifyRequest<{ Params: { watchlistId: number } }>,
	res: FastifyReply
) {
	const { watchlistId } = req.params
	const userId = Number.parseInt(req.user.userId)

	try {
		const existingWatchlist = await db
			.select({ id: watchlists.id })
			.from(watchlists)
			.where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
			.limit(1)

		if (existingWatchlist.length === 0) {
			return res.code(404).send({ error: 'Watchlist not found' })
		}

		await db.delete(watchlists).where(eq(watchlists.id, watchlistId))

		return res.code(200).send({ message: 'Watchlist deleted successfully' })
	} catch (error) {
		return res.code(500).send({ error: 'Failed to delete watchlist' })
	}
}

export async function UpdateWatchlist(
	req: FastifyRequest<{
		Params: { watchlistId: number }
		Body: { name?: string; description?: string; isPublic?: boolean }
	}>,
	res: FastifyReply
) {
	const { watchlistId } = req.params
	const { name, description, isPublic } = req.body
	const userId = Number.parseInt(req.user.userId)

	try {
		// Check if watchlist exists and belongs to the user
		const existingWatchlist = await db
			.select({ id: watchlists.id })
			.from(watchlists)
			.where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
			.limit(1)

		if (existingWatchlist.length === 0) {
			return res.code(404).send({ error: 'Watchlist not found' })
		}

		// Prepare update data
		const updateData: {
			name?: string
			description?: string
			isPublic?: boolean
			updatedAt: Date
		} = {
			updatedAt: new Date(),
		}

		if (name !== undefined) {
			if (name.trim() === '') {
				return res.code(400).send({ error: 'Watchlist name cannot be empty' })
			}
			updateData.name = name.trim()
		}

		if (description !== undefined) {
			updateData.description = description.trim()
		}

		if (isPublic !== undefined) {
			updateData.isPublic = isPublic
		}

		// Update the watchlist
		await db
			.update(watchlists)
			.set(updateData)
			.where(eq(watchlists.id, watchlistId))

		return res.code(200).send({ message: 'Watchlist updated successfully' })
	} catch (error) {
		return res.code(500).send({ error: 'Failed to update watchlist' })
	}
}

export async function GetWatchlist(
	req: FastifyRequest<{
		Params: { watchlistId: number }
		Querystring: PaginationQueryStringType<{ search: string }>
	}>,
	res: FastifyReply
) {
	const { watchlistId } = req.params
	const { page, limit, search } = req.query
	const userId = Number.parseInt(req.user.userId)

	try {
		// Check if watchlist exists and belongs to the user
		const [watchlist] = await db
			.select({
				id: watchlists.id,
				name: watchlists.name,
				description: watchlists.description,
				isPublic: watchlists.isPublic,
				createdAt: watchlists.createdAt,
				updatedAt: watchlists.updatedAt,
			})
			.from(watchlists)
			.where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
			.limit(1)

		if (!watchlist) {
			return res.code(404).send({ error: 'Watchlist not found' })
		}

		// Get watchlist items with pagination and optional search
		if (search && search.trim() !== '') {
			const searchTerm = `%${search}%`
			const whereCondition = and(
				eq(watchlistItems.watchlistId, watchlistId),
				or(
					ilike(movies.title, searchTerm),
					ilike(movies.description, searchTerm)
				)
			)

			const filteredItems = await db
				.select({
					id: movies.id,
					title: movies.title,
					description: movies.description,
					releaseDate: movies.releaseDate,
					rating: movies.rating,
					image: movies.image,
					trailer: movies.trailer,
					addedAt: watchlistItems.addedAt,
				})
				.from(watchlistItems)
				.innerJoin(movies, eq(movies.id, watchlistItems.movieId))
				.where(whereCondition)
				.limit(limit)
				.offset((page - 1) * limit)

			const [totalResult] = await db
				.select({ total: count() })
				.from(watchlistItems)
				.innerJoin(movies, eq(movies.id, watchlistItems.movieId))
				.where(whereCondition)

			if (!totalResult) {
				return res.code(500).send({ error: 'Failed to fetch total count' })
			}

			const totalCount = totalResult.total
			const pagination = Pagination(page, limit, totalCount)

			return res.code(200).send({
				watchlist,
				items: {
					data: filteredItems,
					meta: pagination,
				},
			})
		}

		const watchlistMovies = await db
			.select({
				id: movies.id,
				title: movies.title,
				description: movies.description,
				releaseDate: movies.releaseDate,
				rating: movies.rating,
				image: movies.image,
				trailer: movies.trailer,
				addedAt: watchlistItems.addedAt,
			})
			.from(watchlistItems)
			.where(eq(watchlistItems.watchlistId, watchlistId))
			.innerJoin(movies, eq(movies.id, watchlistItems.movieId))
			.limit(limit)
			.offset((page - 1) * limit)

		const [totalResult] = await db
			.select({ total: count() })
			.from(watchlistItems)
			.where(eq(watchlistItems.watchlistId, watchlistId))

		if (!totalResult) {
			return res.code(500).send({ error: 'Failed to fetch total count' })
		}

		const totalCount = totalResult.total
		const pagination = Pagination(page, limit, totalCount)

		return res.code(200).send({
			watchlist,
			items: {
				data: watchlistMovies,
				meta: pagination,
			},
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to retrieve watchlist data' })
	}
}

export async function AddMovieToWatchlist(
	req: FastifyRequest<{
		Params: { watchlistId: number; movieId: number }
	}>,
	res: FastifyReply
) {
	const { watchlistId, movieId } = req.params
	const userId = Number.parseInt(req.user.userId)

	try {
		// Check if watchlist exists and belongs to the user
		const [watchlist] = await db
			.select({ id: watchlists.id })
			.from(watchlists)
			.where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
			.limit(1)

		if (!watchlist) {
			return res.code(404).send({ error: 'Watchlist not found' })
		}

		// Check if movie exists
		const movieExists = await db
			.select()
			.from(movies)
			.where(eq(movies.id, movieId))
			.limit(1)

		if (movieExists.length === 0) {
			return res.code(404).send({ error: 'Movie not found' })
		}

		// Check if movie is already in the watchlist
		const existingInWatchlist = await db
			.select()
			.from(watchlistItems)
			.where(
				and(
					eq(watchlistItems.watchlistId, watchlistId),
					eq(watchlistItems.movieId, movieId)
				)
			)
			.limit(1)

		if (existingInWatchlist.length > 0) {
			return res.code(400).send({ error: 'Movie already in watchlist' })
		}

		// Add movie to watchlist
		await db.insert(watchlistItems).values({
			watchlistId,
			movieId,
		})

		// Update the watchlist's updatedAt timestamp
		await db
			.update(watchlists)
			.set({ updatedAt: new Date() })
			.where(eq(watchlists.id, watchlistId))

		return res.code(201).send({ message: 'Movie added to watchlist' })
	} catch (error) {
		return res.code(500).send({ error: 'Failed to add movie to watchlist' })
	}
}

export async function RemoveMovieFromWatchlist(
	req: FastifyRequest<{
		Params: { watchlistId: number; movieId: number }
	}>,
	res: FastifyReply
) {
	const { watchlistId, movieId } = req.params
	const userId = Number.parseInt(req.user.userId)

	try {
		// Check if watchlist exists and belongs to the user
		const [watchlist] = await db
			.select({ id: watchlists.id })
			.from(watchlists)
			.where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
			.limit(1)

		if (!watchlist) {
			return res.code(404).send({ error: 'Watchlist not found' })
		}

		// Remove movie from watchlist
		const result = await db
			.delete(watchlistItems)
			.where(
				and(
					eq(watchlistItems.watchlistId, watchlistId),
					eq(watchlistItems.movieId, movieId)
				)
			)
			.returning()

		if (result.length === 0) {
			return res.code(404).send({ error: 'Movie not found in watchlist' })
		}

		// Update the watchlist's updatedAt timestamp
		await db
			.update(watchlists)
			.set({ updatedAt: new Date() })
			.where(eq(watchlists.id, watchlistId))

		return res.code(200).send({ message: 'Movie removed from watchlist' })
	} catch (error) {
		return res
			.code(500)
			.send({ error: 'Failed to remove movie from watchlist' })
	}
}

export async function ToggleWatchlistPublic(
	req: FastifyRequest<{ Params: { watchlistId: number } }>,
	res: FastifyReply
) {
	const { watchlistId } = req.params
	const userId = Number.parseInt(req.user.userId)

	try {
		const [watchlist] = await db
			.select({ isPublic: watchlists.isPublic })
			.from(watchlists)
			.where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
			.limit(1)

		if (!watchlist) {
			return res.code(404).send({ error: 'Watchlist not found' })
		}

		const newPublicStatus = !watchlist.isPublic

		await db
			.update(watchlists)
			.set({
				isPublic: newPublicStatus,
				updatedAt: new Date(),
			})
			.where(eq(watchlists.id, watchlistId))

		return res.code(200).send({
			message: 'Watchlist visibility updated',
			isPublic: newPublicStatus,
		})
	} catch (error) {
		return res
			.code(500)
			.send({ error: 'Failed to update watchlist visibility' })
	}
}

export async function GetUserPublicWatchlists(
	req: FastifyRequest<{
		Querystring: PaginationQueryStringType<{ search: string }>
		Params: { userId: number }
	}>,
	res: FastifyReply
) {
	const { page, limit, search } = req.query
	const { userId } = req.params

	try {
		const userExists = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)

		if (userExists.length === 0) {
			return res.code(404).send({ error: 'User not found' })
		}

		if (search && search.trim() !== '') {
			const searchTerm = `%${search}%`
			const whereCondition = and(
				eq(watchlists.userId, userId),
				eq(watchlists.isPublic, true),
				or(
					ilike(watchlists.name, searchTerm),
					ilike(watchlists.description, searchTerm)
				)
			)

			const filteredWatchlists = await db
				.select({
					id: watchlists.id,
					name: watchlists.name,
					description: watchlists.description,
					createdAt: watchlists.createdAt,
					updatedAt: watchlists.updatedAt,
				})
				.from(watchlists)
				.where(whereCondition)
				.orderBy(desc(watchlists.updatedAt))
				.limit(limit)
				.offset((page - 1) * limit)

			const [totalResult] = await db
				.select({ total: count() })
				.from(watchlists)
				.where(whereCondition)

			if (!totalResult) {
				return res.code(500).send({ error: 'Failed to fetch total count' })
			}

			const totalCount = totalResult.total
			const pagination = Pagination(page, limit, totalCount)

			return res.code(200).send({
				data: filteredWatchlists,
				meta: pagination,
			})
		}

		const userWatchlists = await db
			.select({
				id: watchlists.id,
				name: watchlists.name,
				description: watchlists.description,
				createdAt: watchlists.createdAt,
				updatedAt: watchlists.updatedAt,
			})
			.from(watchlists)
			.where(and(eq(watchlists.userId, userId), eq(watchlists.isPublic, true)))
			.orderBy(desc(watchlists.updatedAt))
			.limit(limit)
			.offset((page - 1) * limit)

		const [totalResult] = await db
			.select({ total: count() })
			.from(watchlists)
			.where(and(eq(watchlists.userId, userId), eq(watchlists.isPublic, true)))

		if (!totalResult) {
			return res.code(500).send({ error: 'Failed to fetch total count' })
		}

		const totalCount = totalResult.total
		const pagination = Pagination(page, limit, totalCount)

		return res.code(200).send({
			data: userWatchlists,
			meta: pagination,
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to retrieve watchlists' })
	}
}

export async function GetPublicWatchlist(
	req: FastifyRequest<{
		Params: { userId: number; watchlistId: number }
		Querystring: PaginationQueryStringType<{ search: string }>
	}>,
	res: FastifyReply
) {
	const { userId, watchlistId } = req.params
	const { page, limit, search } = req.query

	try {
		const [watchlist] = await db
			.select({
				id: watchlists.id,
				name: watchlists.name,
				description: watchlists.description,
				createdAt: watchlists.createdAt,
				updatedAt: watchlists.updatedAt,
			})
			.from(watchlists)
			.where(
				and(
					eq(watchlists.id, watchlistId),
					eq(watchlists.userId, userId),
					eq(watchlists.isPublic, true)
				)
			)
			.limit(1)

		if (!watchlist) {
			return res.code(404).send({ error: 'Watchlist not found or not public' })
		}

		if (search && search.trim() !== '') {
			const searchTerm = `%${search}%`
			const whereCondition = and(
				eq(watchlistItems.watchlistId, watchlistId),
				or(
					ilike(movies.title, searchTerm),
					ilike(movies.description, searchTerm)
				)
			)

			const filteredItems = await db
				.select({
					id: movies.id,
					title: movies.title,
					description: movies.description,
					releaseDate: movies.releaseDate,
					rating: movies.rating,
					image: movies.image,
					trailer: movies.trailer,
					addedAt: watchlistItems.addedAt,
				})
				.from(watchlistItems)
				.innerJoin(movies, eq(movies.id, watchlistItems.movieId))
				.where(whereCondition)
				.limit(limit)
				.offset((page - 1) * limit)

			const [totalResult] = await db
				.select({ total: count() })
				.from(watchlistItems)
				.innerJoin(movies, eq(movies.id, watchlistItems.movieId))
				.where(whereCondition)

			if (!totalResult) {
				return res.code(500).send({ error: 'Failed to fetch total count' })
			}

			const totalCount = totalResult.total
			const pagination = Pagination(page, limit, totalCount)

			return res.code(200).send({
				watchlist,
				items: {
					data: filteredItems,
					meta: pagination,
				},
			})
		}

		const watchlistMovies = await db
			.select({
				id: movies.id,
				title: movies.title,
				description: movies.description,
				releaseDate: movies.releaseDate,
				rating: movies.rating,
				image: movies.image,
				trailer: movies.trailer,
				addedAt: watchlistItems.addedAt,
			})
			.from(watchlistItems)
			.where(eq(watchlistItems.watchlistId, watchlistId))
			.innerJoin(movies, eq(movies.id, watchlistItems.movieId))
			.limit(limit)
			.offset((page - 1) * limit)

		const [totalResult] = await db
			.select({ total: count() })
			.from(watchlistItems)
			.where(eq(watchlistItems.watchlistId, watchlistId))

		if (!totalResult) {
			return res.code(500).send({ error: 'Failed to fetch total count' })
		}

		const totalCount = totalResult.total
		const pagination = Pagination(page, limit, totalCount)

		return res.code(200).send({
			watchlist,
			items: {
				data: watchlistMovies,
				meta: pagination,
			},
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to retrieve watchlist data' })
	}
}
