import { asc, desc } from 'drizzle-orm'
import { z } from 'zod'
import { movies } from '@/db/schema/movie'

type OrderableMovieFields = keyof Omit<
	MovieType,
	'genres' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export const validMovieFields: OrderableMovieFields[] = [
	'id',
	'title',
	'description',
	'releaseDate',
	'rating',
	'image',
	'trailer',
]

export function getMovieSelectClause() {
	return {
		id: movies.id,
		title: movies.title,
		description: movies.description,
		releaseDate: movies.releaseDate,
		rating: movies.rating,
		image: movies.image,
		trailer: movies.trailer,
	}
}

export const orderByValidator = z
	.string()
	.refine((field) => validMovieFields.includes(field as OrderableMovieFields), {
		message: `Field must be one of: ${validMovieFields.join(', ')}`,
	})

export function applyMovieOrdering(orderBy: string, order: 'asc' | 'desc') {
	const validatedField = orderByValidator.safeParse(orderBy)
	const fieldToOrderBy = validatedField.success ? orderBy : 'rating'

	switch (fieldToOrderBy) {
		case 'title':
			return order === 'asc' ? asc(movies.title) : desc(movies.title)
		case 'releaseDate':
			return order === 'asc'
				? asc(movies.releaseDate)
				: desc(movies.releaseDate)
		case 'rating':
			return order === 'asc' ? asc(movies.rating) : desc(movies.rating)
		case 'id':
			return order === 'asc' ? asc(movies.id) : desc(movies.id)
		case 'image':
			return order === 'asc' ? asc(movies.image) : desc(movies.image)
		case 'trailer':
			return order === 'asc' ? asc(movies.trailer) : desc(movies.trailer)
		case 'description':
			return order === 'asc'
				? asc(movies.description)
				: desc(movies.description)
		default:
			return order === 'asc' ? asc(movies.rating) : desc(movies.rating)
	}
}
