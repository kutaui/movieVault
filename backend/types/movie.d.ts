type Movie = {
	id: number
	title: string
	description: string
	releaseDate: string
	rating: number
	image: string
	trailer: string
	genres: Genre[]
	createdAt: string
	updatedAt: string
	deletedAt: string
}

type Genre = {
	id: number
	name: string
}
