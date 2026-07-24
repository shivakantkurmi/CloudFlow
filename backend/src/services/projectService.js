import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { eventBus } from '../events/eventBus.js';

const memberUserSelect = { id: true, email: true, firstName: true, lastName: true, avatar: true };
const projectIncludeForActor = (actorId) => ({
  organization: { select: { name: true } }, 
  _count: { select: { members: true, tasks: true } },
  members: { where: { userId: actorId }, select: { role: true } }
});

const serializeProject = (project) => {
  const userRole = project.members?.[0]?.role;
  return {
    ...project,
    memberCount: project._count?.members,
    taskCount: project._count?.tasks,
    userRole,
    _count: undefined,
    members: undefined,
  };
};

export const createProject = async (input, actor) => {
  const { organizationId, ...rest } = input;
  const existing = await prisma.project.findUnique({ where: { key: input.key } });
  if (existing) throw new AppError('This project key is already in use.', 409);

  const project = await prisma.project.create({
    data: {
      ...rest,
      organizationId,
      members: { create: { userId: actor.id, role: 'PROJECT_MANAGER' } },
    },
    include: projectIncludeForActor(actor.id),
  });
  return serializeProject(project);
};

export const listProjects = async (actor, organizationId, limit = 50) => {
  // If orgId is provided, verify user is in org, otherwise list all projects the user is in across orgs
  const where = { status: { not: 'DELETED' } };
  
  if (organizationId) {
    where.organizationId = organizationId;
    const orgMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId: actor.id } }
    });
    if (!orgMember) throw new AppError('You do not have access to this organization.', 403);
    if (orgMember.role !== 'OWNER' && orgMember.role !== 'ADMIN') {
      where.OR = [{ visibility: 'PUBLIC' }, { members: { some: { userId: actor.id } } }];
    }
  } else {
    // Orgs where user is OWNER/ADMIN
    const adminOrgs = await prisma.organizationMember.findMany({
      where: { userId: actor.id, role: { in: ['OWNER', 'ADMIN'] } },
      select: { organizationId: true }
    });
    const adminOrgIds = adminOrgs.map(o => o.organizationId);
    
    where.OR = [
      { organizationId: { in: adminOrgIds } },
      { members: { some: { userId: actor.id } } }
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    include: projectIncludeForActor(actor.id),
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });
  return projects.map(serializeProject);
};

export const getProject = async (id, actor) => {
  const project = await prisma.project.findUnique({ where: { id }, include: projectIncludeForActor(actor.id) });
  if (!project || project.status === 'DELETED') throw new AppError('Project not found.', 404);
  return serializeProject(project);
};

export const updateProject = async (id, input, actor) => {
  return serializeProject(await prisma.project.update({ where: { id }, data: input, include: projectIncludeForActor(actor.id) }));
};

export const deleteProject = async (id) => {
  await prisma.project.update({ where: { id }, data: { status: 'DELETED' } });
};

export const listMembers = async (id) => {
  return prisma.projectMember.findMany({
    where: { projectId: id },
    include: { user: { select: memberUserSelect } },
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
  });
};

export const addMember = async (id, { email, role = 'DEVELOPER' }, actor) => {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, status: true } });
  if (!user) throw new AppError('No user exists for this email address.', 404);
  if (user.status !== 'ACTIVE') throw new AppError('Only active users can be added to projects.', 422);
  
  const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: id, userId: user.id } } });
  if (membership) throw new AppError('This user is already a project member.', 409);
  
  const newMember = await prisma.projectMember.create({ data: { projectId: id, userId: user.id, role }, include: { user: { select: memberUserSelect } } });
  eventBus.emit('member:added', { projectId: id, userId: user.id, role, actor });
  return newMember;
};

export const removeMember = async (id, userId, actor) => {
  const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: id, userId } } });
  if (!membership) throw new AppError('Project member not found.', 404);
  
  await prisma.projectMember.delete({ where: { id: membership.id } });
  eventBus.emit('member:removed', { projectId: id, userId, actor });
};
