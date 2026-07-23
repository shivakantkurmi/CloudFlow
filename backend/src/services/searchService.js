import { prisma } from '../config/prisma.js';

const isSystemAdmin = (actor) => actor.role === 'ADMIN';

const projectWhereClause = (actor) => {
  if (isSystemAdmin(actor)) {
    return { status: { not: 'DELETED' } };
  }
  return {
    status: { not: 'DELETED' },
    OR: [
      { visibility: 'PUBLIC' },
      { ownerId: actor.sub },
      { members: { some: { userId: actor.sub } } }
    ]
  };
};

export const globalSearch = async (query, actor) => {
  if (!query || query.trim().length === 0) {
    return { projects: [], tasks: [] };
  }

  const searchTerm = query.trim();
  const searchFilter = {
    contains: searchTerm,
    mode: 'insensitive' // Requires PostgreSQL
  };

  const projectCondition = projectWhereClause(actor);

  const projects = await prisma.project.findMany({
    where: {
      ...projectCondition,
      OR: [
        { name: searchFilter },
        { key: searchFilter },
        { description: searchFilter }
      ]
    },
    select: {
      id: true,
      name: true,
      key: true,
      description: true,
      status: true
    },
    take: 10
  });

  const tasks = await prisma.task.findMany({
    where: {
      project: projectCondition,
      OR: [
        { title: searchFilter },
        { description: searchFilter }
      ]
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      projectId: true,
      project: { select: { key: true, name: true } }
    },
    take: 20
  });

  return { projects, tasks };
};
