import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { movies } from './movie'
import { users } from './user'

export const comments = pgTable('comments', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
