import {
	date,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'

export const movies = pgTable('movies', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	releaseDate: date('release_date').notNull(),
	rating: integer().notNull(),
	image: varchar({ length: 255 }).notNull(),
	trailer: varchar({ length: 255 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
})

export const streamingUrls = pgTable('streaming_urls', {
	id: serial('id').primaryKey(),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, { onDelete: 'cascade' }),
	url: text('url').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
})

export const genres = pgTable('genres', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
})

export const movieToGenre = pgTable(
	'movie_to_genre',
	{
		movieId: integer('movie_id')
			.notNull()
			.references(() => movies.id, { onDelete: 'cascade' }),
		genreId: integer('genre_id')
			.notNull()
			.references(() => genres.id, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.movieId, table.genreId] })]
)
