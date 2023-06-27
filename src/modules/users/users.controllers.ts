import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import type {
	LoginBody,
	CreateUserBody,
	AssignRoleToUserBody,
} from './users.schemas';
import { SYSTEM_ROLES } from '../../config/permissions';
import { getRoleByName } from '../roles/roles.services';
import {
	assignRoleToUser,
	createUser,
	getUserByEmail,
	getUsersByApplication,
} from './users.services';
import { logger } from '../../utils/logger';

export async function createUserHandler(
	request: FastifyRequest<{
		Body: CreateUserBody;
	}>,
	reply: FastifyReply
) {
	const { initialUser, ...data } = request.body;

	const roleName = initialUser
		? SYSTEM_ROLES.SUPER_ADMIN
		: SYSTEM_ROLES.APPLICATION_USER;

	if (roleName === SYSTEM_ROLES.SUPER_ADMIN) {
		const appUsers = await getUsersByApplication(data.applicationId);

		if (appUsers.length > 0) {
			return reply.code(400).send({
				message: 'Application already has a super admin user.',
				extentions: {
					code: 'APPLICATION_ALREADY_SUPER_USER',
					applicationId: data.applicationId,
				},
			});
		}
	}

	const role = await getRoleByName({
		name: roleName,
		applicationId: data.applicationId,
	});

	if (!role) {
		reply.code(404).send({
			message: 'Role not found.',
		});
	}

	try {
		const user = await createUser(data);

		// assign a role to the user
		await assignRoleToUser({
			applicationId: data.applicationId,
			userId: user.id,
			roleId: role.id,
		});

		return user;
	} catch (e) {
		logger.error(e, 'Error creating new user.');
		return reply.code(400).send({
			message: 'Failed to create user.',
		});
	}
}

export async function loginHandler(
	request: FastifyRequest<{
		Body: LoginBody;
	}>,
	reply: FastifyReply
) {
	const { applicationId, email, password } = request.body;

	const user = await getUserByEmail({ email, applicationId });

	if (!user)
		return reply.code(400).send({
			message: 'Invalid email or password.',
		});

	const token = jwt.sign(
		{
			id: user.id,
			applicationId,
			email,
			scopes: user.permissions,
		},
		'secret'
	); // change the signing method

	return { token };
}

export async function assignRoleToUserHandler(
	request: FastifyRequest<{
		Body: AssignRoleToUserBody;
	}>,
	reply: FastifyReply
) {
	const applicationId = request.user.applicationId;
	const { userId, roleId } = request.body;

	try {
		const result = await assignRoleToUser({ applicationId, userId, roleId });

		return result;
	} catch (e) {
		logger.error(e, 'Error assigning role to user.');
		return reply.code(400).send({
			message: 'Failed to assign role to user.',
		});
	}
}
