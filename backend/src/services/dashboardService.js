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

export const getDashboardStats = async (actor) => {
  const accessibleProjectsWhere = projectWhereClause(actor);

  const [
    projectCount,
    myTaskCount,
    myIncompleteTaskCount,
    recentTasks,
    recentActivity
  ] = await Promise.all([
    prisma.project.count({ where: accessibleProjectsWhere }),
    prisma.task.count({ where: { assigneeId: actor.sub } }),
    prisma.task.count({ where: { assigneeId: actor.sub, status: { not: 'COMPLETED' } } }),
    prisma.task.findMany({
      where: { assigneeId: actor.sub, status: { not: 'COMPLETED' } },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      take: 5,
      include: { project: { select: { key: true, name: true } } }
    }),
    prisma.activityLog.findMany({
      where: { project: accessibleProjectsWhere },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
    })
  ]);

  // Grouping manually since prisma group by doesn't easily return zero for missing enums
  // But we can just use groupBy
  const groupedStatuses = await prisma.task.groupBy({
    by: ['status'],
    where: { assigneeId: actor.sub },
    _count: { status: true }
  });

  const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, TESTING: 0, COMPLETED: 0 };
  groupedStatuses.forEach(g => {
    tasksByStatus[g.status] = g._count.status;
  });

  return {
    projectCount,
    myTaskCount,
    myIncompleteTaskCount,
    tasksByStatus,
    recentTasks,
    recentActivity
  };
};
