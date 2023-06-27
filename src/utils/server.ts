import fastify from 'fastify';
import guard from 'fastify-guard';
import jwt from 'jsonwebtoken';
import { logger } from './logger';
import { applicationRoutes } from '../modules/applications/applications.routes';
import { userRoutes } from '../modules/users/users.routes';
import { roleRoutes } from '../modules/roles/roles.routes';

type User = {
	id: string;
	applicationId: string;
	scopes: Array<string>;
};

declare module 'fastify' {
	interface FastifyRequest {
		user: User;
	}
}

export async function buildServer() {
	const app = fastify({
		logger,
	});

	app.decorateRequest('user', null);

	app.addHook('onRequest', async (request, reply) => {
		const authHeader = request.headers.authorization;

		if (!authHeader) return;

		try {
			const token = authHeader.replace('Bearer', '');

			const decoded = jwt.verify(token, 'secret') as User;

			request.user = decoded;
		} catch (e) {}
	});

	// register plugins
	app.register(guard, {
		requestProperty: 'user',
		scopeProperty: 'scopes',
		errorHandler: (result, request, reply) => {
			return reply.status(401).send('You do not have permission to do that.');
		},
	});

	// register routes
	app.register(applicationRoutes, { prefix: '/api/applications' });
	app.register(userRoutes, { prefix: '/api/users' });
	app.register(roleRoutes, { prefix: '/api/roles' });

	return app;
}
