import {
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

export const applications = pgTable('applications', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 256 }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().notNull(),
		email: varchar('email', { length: 256 }).notNull(),
		firstName: varchar('first_name', { length: 256 }).notNull(),
		lastName: varchar('last_name', { length: 256 }).notNull(),
		password: varchar('password', { length: 256 }).notNull(),
		applicationId: uuid('application_id').references(() => applications.id),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	users => {
		return {
			cpk: primaryKey(users.email, users.applicationId),
			idIndex: uniqueIndex('users_id_index').on(users.id),
		};
	}
);

export const roles = pgTable(
	'roles',
	{
		id: uuid('id').defaultRandom().notNull(),
		name: varchar('name', { length: 256 }).notNull(),
		applicationId: uuid('application_id').references(() => applications.id),
		permissions: text('permissions').array().$type<Array<string>>(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	roles => {
		return {
			cpk: primaryKey(roles.name, roles.applicationId),
			idIndex: uniqueIndex('roles_id_index').on(roles.id),
		};
	}
);

export const usersToRoles = pgTable(
	'users_to_roles',
	{
		applicationId: uuid('application_id')
			.references(() => applications.id)
			.notNull(),
		userId: uuid('user_id')
			.references(() => users.id)
			.notNull(),
		roleId: uuid('role_id')
			.references(() => roles.id)
			.notNull(),
	},
	usersToRoles => {
		return {
			cpk: primaryKey(
				usersToRoles.applicationId,
				usersToRoles.userId,
				usersToRoles.roleId
			),
		};
	}
);
