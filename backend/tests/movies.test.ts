import { expect, test } from 'bun:test'

const SERVER_URL = `${process.env.SERVER_URL}:${process.env.PORT}/api`

test('Get all movies', async () => {
	const response = await fetch(`${SERVER_URL}/movies`)
	expect(response.status).toBe(200)

	const data = (await response.json()) as {
		data: Array<{
			id: number
			title: string
			description: string
			releaseDate: string
			rating: number
			image: string
			trailer: string
		}>
		meta: {
			page: number
			perPage: number
			totalPages: number
			currentPage: number
			previousPage: number
			nextPage: number
			isFirstPage: boolean
			isLastPage: boolean
		}
	}

	expect(data).toHaveProperty('data')
	expect(data).toHaveProperty('meta')
	expect(Array.isArray(data.data)).toBe(true)
	expect(data.data.length).toBeGreaterThan(0)

	expect(data.meta.currentPage).toBe(1)
	expect(data.meta.perPage).toBe(10)
})

test('Get all movies by genre', async () => {
	const genreId = 1 // Action genre
	const genreResponse = await fetch(`${SERVER_URL}/genres/${genreId}`)
	expect(genreResponse.status).toBe(200)

	const genreData = await genreResponse.json()
	const genre = Array.isArray(genreData) ? genreData[0] : genreData
	expect(genre.id).toBe(genreId)
	expect(genre.name).toBe('Action')

	const moviesResponse = await fetch(`${SERVER_URL}/movies/genre/${genre.id}`)
	expect(moviesResponse.status).toBe(200)

	const moviesData = (await moviesResponse.json()) as {
		data: Array<{
			movies: { id: number; title: string }
			genres: { id: number; name: string }
		}>
	}
	expect(moviesData).toHaveProperty('data')
	expect(Array.isArray(moviesData.data)).toBe(true)

	for (const movie of moviesData.data) {
		expect(movie.genres.id).toBe(genreId)
		expect(movie.genres.name).toBe('Action')
	}
})
