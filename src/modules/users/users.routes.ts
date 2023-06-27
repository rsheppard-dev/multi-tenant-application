import { FastifyInstance } from 'fastify';
import {
	AssignRoleToUserBody,
	asignRoleToUserJsonSchema,
	createUserJsonScema,
	loginJsonSchema,
} from './users.schemas';
import {
	assignRoleToUserHandler,
	createUserHandler,
	loginHandler,
} from './users.controllers';
import { PERMISSIONS } from '../../config/permissions';

export async function userRoutes(app: FastifyInstance) {
	app.post(
		'/',
		{
			schema: createUserJsonScema,
		},
		createUserHandler
	);

	app.post(
		'/login',
		{
			schema: loginJsonSchema,
		},
		loginHandler
	);

	app.post<{
		Body: AssignRoleToUserBody;
	}>(
		'/roles',
		{
			schema: asignRoleToUserJsonSchema,
			preHandler: [app.guard.scope([PERMISSIONS['users:roles:create']])],
		},
		assignRoleToUserHandler
	);
}
