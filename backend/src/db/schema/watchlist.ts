import { integer, pgTable, primaryKey, timestamp, varchar, text, boolean } from 'drizzle-orm/pg-core'
import { users } from './user'
import { movies } from './movie'

export const watchlists = pgTable(
	'watchlists',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: varchar('name', { length: 255 }).notNull(),
		description: text('description'),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		isPublic: boolean('is_public').notNull().default(false),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	}
)

export const watchlistItems = pgTable(
	'watchlist_items',
	{
		watchlistId: integer('watchlist_id')
			.notNull()
			.references(() => watchlists.id, { onDelete: 'cascade' }),
		movieId: integer('movie_id')
			.notNull()
			.references(() => movies.id, { onDelete: 'cascade' }),
		addedAt: timestamp('added_at').notNull().defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.watchlistId, table.movieId] })]
)
