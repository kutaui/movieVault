import { expect, test } from 'bun:test'

const SERVER_URL = `${process.env.SERVER_URL}:${process.env.PORT}`

test('Get all movies', async () => {
	const response = await fetch(`${SERVER_URL}/movies`)
	const data = await response.json()
	expect(data).toBeDefined()
})
