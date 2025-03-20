import { Role } from '@prisma/client';

import { handleAuthorizeUserSession } from './handle-authorize-user-session';
import { handleRBAC } from './handle-rbac';

export const GENERAL_CRUD_ROLES = [Role.SERVICE_MASTER, Role.ADMIN, Role.USER];

export { handleAuthorizeUserSession, handleRBAC };
