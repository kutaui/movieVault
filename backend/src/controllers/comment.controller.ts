import { db } from '@/db/index'
import { comments } from '@/db/schema/comment'
import { movies } from '@/db/schema/movie'
import { users } from '@/db/schema/user'
import { Pagination } from '@/utils/pagination'
import { and, count, eq, ilike } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function GetMovieComments(
	req: FastifyRequest<{
		Querystring: PaginationQueryStringType<{ search: string }>
		Params: { movieId: number }
	}>,
	res: FastifyReply
) {
	const { page, limit, search } = req.query
	const { movieId } = req.params

	try {
		const movieExists = await db
			.select()
			.from(movies)
			.where(eq(movies.id, movieId))
			.limit(1)

		if (movieExists.length === 0) {
			return res.code(404).send({ error: 'Movie not found' })
		}

		if (search && search.trim() !== '') {
			const searchTerm = `%${search}%`
			const whereCondition = and(
				eq(comments.movieId, movieId),
				ilike(comments.content, searchTerm)
			)

			const filteredComments = await db
				.select({
					id: comments.id,
					content: comments.content,
					createdAt: comments.createdAt,
					updatedAt: comments.updatedAt,
					userId: comments.userId,
					userName: users.name,
				})
				.from(comments)
				.innerJoin(users, eq(users.id, comments.userId))
				.where(whereCondition)
				.orderBy(comments.createdAt)
				.limit(limit)
				.offset((page - 1) * limit)

			const [totalResult] = await db
				.select({ total: count() })
				.from(comments)
				.where(whereCondition)

			if (!totalResult) {
				return res.code(500).send({ error: 'Failed to fetch total count' })
			}

			const totalCount = totalResult.total
			const pagination = Pagination(page, limit, totalCount)

			return res.code(200).send({
				data: filteredComments,
				meta: pagination,
			})
		}

		const movieComments = await db
			.select({
				id: comments.id,
				content: comments.content,
				createdAt: comments.createdAt,
				updatedAt: comments.updatedAt,
				userId: comments.userId,
				userName: users.name,
			})
			.from(comments)
			.innerJoin(users, eq(users.id, comments.userId))
			.where(eq(comments.movieId, movieId))
			.orderBy(comments.createdAt)
			.limit(limit)
			.offset((page - 1) * limit)

		const [totalResult] = await db
			.select({ total: count() })
			.from(comments)
			.where(eq(comments.movieId, movieId))

		if (!totalResult) {
			return res.code(500).send({ error: 'Failed to fetch total count' })
		}

		const totalCount = totalResult.total
		const pagination = Pagination(page, limit, totalCount)

		return res.code(200).send({
			data: movieComments,
			meta: pagination,
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to retrieve comments' })
	}
}

export async function AddComment(
	req: FastifyRequest<{
		Params: { movieId: number }
		Body: { content: string }
	}>,
	res: FastifyReply
) {
	const { movieId } = req.params
	const { content } = req.body
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

		if (!content || content.trim() === '') {
			return res.code(400).send({ error: 'Comment content is required' })
		}

		const [newComment] = await db
			.insert(comments)
			.values({
				userId,
				movieId,
				content,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()

		const userResult = await db
			.select({
				name: users.name,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)

		const userName =
			userResult.length > 0 && userResult[0] ? userResult[0].name : null

		return res.code(201).send({
			message: 'Comment added successfully',
			comment: {
				...newComment,
				userName,
			},
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to add comment' })
	}
}

export async function UpdateComment(
	req: FastifyRequest<{
		Params: { commentId: number }
		Body: { content: string }
	}>,
	res: FastifyReply
) {
	const { commentId } = req.params
	const { content } = req.body
	const userId = Number.parseInt(req.user.userId)

	try {
		if (!content || content.trim() === '') {
			return res.code(400).send({ error: 'Comment content is required' })
		}

		const existingComment = await db
			.select()
			.from(comments)
			.where(eq(comments.id, commentId))
			.limit(1)

		if (existingComment.length === 0) {
			return res.code(404).send({ error: 'Comment not found' })
		}

		if (existingComment[0]?.userId !== userId) {
			return res
				.code(403)
				.send({ error: 'You can only update your own comments' })
		}

		const [updatedComment] = await db
			.update(comments)
			.set({
				content,
				updatedAt: new Date(),
			})
			.where(eq(comments.id, commentId))
			.returning()

		return res.code(200).send({
			message: 'Comment updated successfully',
			comment: updatedComment,
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to update comment' })
	}
}

export async function DeleteComment(
	req: FastifyRequest<{
		Params: { commentId: number }
	}>,
	res: FastifyReply
) {
	const { commentId } = req.params
	const userId = Number.parseInt(req.user.userId)

	try {
		const existingComment = await db
			.select()
			.from(comments)
			.where(eq(comments.id, commentId))
			.limit(1)

		if (existingComment.length === 0) {
			return res.code(404).send({ error: 'Comment not found' })
		}

		if (existingComment[0]?.userId !== userId) {
			return res
				.code(403)
				.send({ error: 'You can only delete your own comments' })
		}

		await db.delete(comments).where(eq(comments.id, commentId))

		return res.code(200).send({
			message: 'Comment deleted successfully',
		})
	} catch (error) {
		return res.code(500).send({ error: 'Failed to delete comment' })
	}
}
