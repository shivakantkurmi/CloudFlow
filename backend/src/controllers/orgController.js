import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

const respond = (res, status, data, message) => res.status(status).json({ success: true, data, message });

export const createOrganization = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) throw new AppError('Organization name is required', 400);

    const ownedOrgsCount = await prisma.organizationMember.count({
      where: {
        userId,
        role: 'OWNER',
      },
    });

    if (ownedOrgsCount >= 5) {
      throw new AppError('You cannot create more than 5 workspaces.', 403, 'WORKSPACE_LIMIT_REACHED');
    }

    const org = await prisma.organization.create({
      data: {
        name,
        members: { create: { userId, role: 'OWNER' } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });

    respond(res, 201, org, 'Organization created.');
  } catch (error) {
    next(error);
  }
};

export const getUserOrganizations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orgs = await prisma.organization.findMany({
      where: {
        AND: [
          { members: { some: { userId } } },
          {
            OR: [
              { members: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } } },
              { projects: { some: { status: { not: 'DELETED' }, members: { some: { userId } } } } }
            ]
          }
        ]
      },
      include: {
        members: { where: { userId }, select: { role: true, userId: true } },
        _count: { select: { members: true, projects: true } },
      },
    });

    respond(res, 200, orgs, 'Organizations retrieved.');
  } catch (error) {
    next(error);
  }
};

export const getOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
        projects: {
          include: { _count: { select: { tasks: true } } }
        }
      },
    });

    if (!org) throw new AppError('Organization not found', 404);
    respond(res, 200, org, 'Organization retrieved.');
  } catch (error) {
    next(error);
  }
};

export const deleteOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId } },
    });

    if (!member || member.role !== 'OWNER') {
      throw new AppError('Only the organization owner can delete the workspace', 403);
    }

    const ownedOrgsCount = await prisma.organizationMember.count({
      where: { userId, role: 'OWNER' },
    });

    if (ownedOrgsCount <= 1) {
      throw new AppError('You must have at least one workspace. Cannot delete your only workspace.', 400);
    }

    const activeProjectsCount = await prisma.project.count({
      where: { organizationId: id, status: { not: 'DELETED' } },
    });

    if (activeProjectsCount > 0) {
      throw new AppError(`Cannot delete workspace. There are ${activeProjectsCount} active project(s) inside it. Please delete them first.`, 400);
    }

    await prisma.organization.delete({ where: { id } });
    respond(res, 200, { id }, 'Organization deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const addOrganizationMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('No user found with this email address', 404);

    const existingMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId: user.id } },
    });

    if (existingMember) throw new AppError('User is already a member of this organization', 409);

    const member = await prisma.organizationMember.create({
      data: { organizationId: id, userId: user.id, role: role || 'MEMBER' },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    respond(res, 201, member, 'Member added.');
  } catch (error) {
    next(error);
  }
};

export const removeOrganizationMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId } },
    });

    if (!member) throw new AppError('Member not found', 404);
    if (member.role === 'OWNER') throw new AppError('Cannot remove the organization owner', 403);

    await prisma.organizationMember.delete({ where: { id: member.id } });
    respond(res, 200, null, 'Member removed.');
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationMemberRole = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      throw new AppError('Invalid role. Cannot reassign OWNER role this way.', 400);
    }

    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: id, userId } },
    });

    if (!member) throw new AppError('Member not found', 404);
    if (member.role === 'OWNER') throw new AppError('Cannot change the role of the organization owner', 403);

    const updated = await prisma.organizationMember.update({
      where: { id: member.id },
      data: { role },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    respond(res, 200, updated, 'Member role updated.');
  } catch (error) {
    next(error);
  }
};
