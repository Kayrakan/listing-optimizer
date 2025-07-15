export const users = pgTable('users', {
    id: uuid('id').primaryKey(),
    email: text('email').notNull(),
    credits: integer('credits').default(0).notNull(),
    // …other cols
});