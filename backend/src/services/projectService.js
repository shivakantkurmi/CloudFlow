import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { eventBus } from '../events/eventBus.js';

const memberUserSelect = { id: true, email: true, firstName: true, lastName: true, avatar: true, role: true };
const projectInclude = { owner: { select: memberUserSelect }, _count: { select: { members: true, tasks: true } } };
const isSystemAdmin = (actor) => actor.role === 'ADMIN';
const isManager = (membership) => membership?.role === 'ADMIN' || membership?.role === 'LEAD';

const fetchMembership = (projectId, userId) => prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });

const projectWhereFor = (id, actor) => ({
  id,
  status: { not: 'DELETED' },
  ...(isSystemAdmin(actor) ? {} : { OR: [{ visibility: 'PUBLIC' }, { ownerId: actor.sub }, { members: { some: { userId: actor.sub } } }] }),
});

const getAccessibleProject = async (id, actor, include = projectInclude) => {
  const project = await prisma.project.findFirst({ where: projectWhereFor(id, actor), include });
  if (!project) throw new AppError('Project not found or is not accessible.', 404, 'PROJECT_NOT_FOUND');
  return project;
};

const assertManager = async (project, actor) => {
  if (isSystemAdmin(actor) || project.ownerId === actor.sub) return;
  const membership = await fetchMembership(project.id, actor.sub);
  if (!isManager(membership)) throw new AppError('Project manager permission is required.', 403, 'FORBIDDEN');
};

const assertMembership = async (project, actor) => {
  if (isSystemAdmin(actor) || project.ownerId === actor.sub) return;
  const membership = await fetchMembership(project.id, actor.sub);
  if (!membership) throw new AppError('Project membership is required.', 403, 'FORBIDDEN');
};

const serializeProject = (project) => ({
  ...project,
  memberCount: project._count?.members,
  taskCount: project._count?.tasks,
  _count: undefined,
});

export const createProject = async (input, actor) => {
  const existing = await prisma.project.findUnique({ where: { key: input.key } });
  if (existing) throw new AppError('This project key is already in use.', 409, 'DUPLICATE_ENTRY');

  const project = await prisma.project.create({
    data: {
      ...input,
      ownerId: actor.sub,
      members: { create: { userId: actor.sub, role: 'ADMIN' } },
    },
    include: projectInclude,
  });
  return serializeProject(project);
};

export const listProjects = async (actor, limit = 50) => {
  const projects = await prisma.project.findMany({
    where: {
      status: { not: 'DELETED' },
      ...(isSystemAdmin(actor) ? {} : { OR: [{ visibility: 'PUBLIC' }, { ownerId: actor.sub }, { members: { some: { userId: actor.sub } } }] }),
    },
    include: projectInclude,
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });
  return projects.map(serializeProject);
};

export const getProject = async (id, actor) => serializeProject(await getAccessibleProject(id, actor));

export const updateProject = async (id, input, actor) => {
  const project = await getAccessibleProject(id, actor);
  await assertManager(project, actor);
  return serializeProject(await prisma.project.update({ where: { id }, data: input, include: projectInclude }));
};

export const deleteProject = async (id, actor) => {
  const project = await getAccessibleProject(id, actor);
  if (!isSystemAdmin(actor) && project.ownerId !== actor.sub) throw new AppError('Only the project owner can delete this project.', 403, 'FORBIDDEN');
  await prisma.project.update({ where: { id }, data: { status: 'DELETED' } });
};

export const listMembers = async (id, actor) => {
  const project = await getAccessibleProject(id, actor);
  await assertMembership(project, actor);
  return prisma.projectMember.findMany({
    where: { projectId: project.id },
    include: { user: { select: memberUserSelect } },
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
  });
};

export const addMember = async (id, { email, role = 'MEMBER' }, actor) => {
  const project = await getAccessibleProject(id, actor);
  await assertManager(project, actor);
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, status: true } });
  if (!user) throw new AppError('No user exists for this email address.', 404, 'USER_NOT_FOUND');
  if (user.status !== 'ACTIVE') throw new AppError('Only active users can be added to projects.', 422, 'USER_INACTIVE');
  const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: id, userId: user.id } } });
  if (membership) throw new AppError('This user is already a project member.', 409, 'DUPLICATE_ENTRY');
  const newMember = await prisma.projectMember.create({ data: { projectId: id, userId: user.id, role }, include: { user: { select: memberUserSelect } } });
  eventBus.emit('member:added', { projectId: id, userId: user.id, role, actor });
  return newMember;
};

export const removeMember = async (id, userId, actor) => {
  const project = await getAccessibleProject(id, actor);
  await assertManager(project, actor);
  if (project.ownerId === userId) throw new AppError('The project owner cannot be removed.', 422, 'OWNER_MEMBERSHIP_REQUIRED');
  const membership = await fetchMembership(id, userId);
  if (!membership) throw new AppError('Project member not found.', 404, 'MEMBER_NOT_FOUND');
  await prisma.projectMember.delete({ where: { id: membership.id } });
  eventBus.emit('member:removed', { projectId: id, userId, actor });
};
