import { integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core'
import { users } from './user'
import { movies } from './movie'

export const watchlists = pgTable(
	'watchlists',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		movieId: integer('movie_id')
			.notNull()
			.references(() => movies.id, { onDelete: 'cascade' }),
		addedAt: timestamp('added_at').notNull().defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.movieId] })]
)
