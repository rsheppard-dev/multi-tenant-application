export const ALL_PERMISSIONS = [
	// users
	'users:roles:create', // allowed to add a role to a user
	'users:roles:delete', // allowed to remove a role from a user

	// roles
	'roles:create',

	// posts
	'posts:create',
	'posts:read',
	'posts:delete',
	'posts:update',
] as const;

export const PERMISSIONS = ALL_PERMISSIONS.reduce((acc, permission) => {
	acc[permission] = permission;

	return acc;
}, {} as Record<(typeof ALL_PERMISSIONS)[number], (typeof ALL_PERMISSIONS)[number]>);

export const USER_ROLE_PERMISSIONS = [
	PERMISSIONS['posts:read'],
	PERMISSIONS['posts:create'],
];

export const SYSTEM_ROLES = {
	SUPER_ADMIN: 'SUPER_ADMIN',
	APPLICATION_USER: 'APPLICATION_USER',
};
