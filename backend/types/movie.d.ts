type MovieType = {
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

type GenreType = {
	id: number
	name: string
}
