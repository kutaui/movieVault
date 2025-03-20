import {
	pgTable,
	serial,
	integer,
	pgEnum,
	timestamp,
	text,
	jsonb,
} from 'drizzle-orm/pg-core'
import { users } from './user'
import { movies } from './movie'

export const userEventTypeEnum = pgEnum('user_event_type', [
	'HOVER',
	'DETAIL_VIEW',
	'PLAY',
	'PAUSE',
	'STOP',
	'ADD_FAVORITE',
	'REMOVE_FAVORITE',
	'SEARCH',
	'GENRE',
	'SHARE',
	'WATCH_TRAILER',
	'CUSTOM_RECOMMENDATION_CLICK',
])

export const userEvents = pgTable('user_events', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	movieId: integer('movie_id').references(() => movies.id, {
		onDelete: 'cascade',
	}),
	eventType: userEventTypeEnum('event_type').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	duration: integer('duration'),
	metadata: jsonb('metadata'),
})
