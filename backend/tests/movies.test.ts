import { expect, test } from 'bun:test'

test('Get all movies', async () => {
	const response = await fetch('http://localhost:3099/movies')
	const data = await response.json()
	expect(data).toBeDefined()
})
