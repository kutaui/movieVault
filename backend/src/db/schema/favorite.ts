import {
	boolean,
	integer,
	pgTable,
	primaryKey,
	timestamp,
  } from 'drizzle-orm/pg-core';
  import { movies } from './movie';
  import { users } from './user';
  
  export const favorites = pgTable(
	'favorites',
	{
	  userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	  movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, { onDelete: 'cascade' }),
	  isPublic: boolean('is_public').notNull().default(false),
	  createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.movieId] })]
  );
  