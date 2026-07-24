import { prisma } from '../config/prisma.js';

const projectWhereClause = async (actor, organizationId) => {
  const where = { status: { not: 'DELETED' } };
  
  if (organizationId) {
    where.organizationId = organizationId;
    const orgMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId: actor.id } }
    });
    if (!orgMember) return { id: 'NO_ACCESS' };
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
  return where;
};

export const getDashboardStats = async (actor, organizationId) => {
  const accessibleProjectsWhere = await projectWhereClause(actor, organizationId);
  const taskWhere = { assigneeId: actor.id, project: accessibleProjectsWhere };

  const [
    projectCount,
    myTaskCount,
    myIncompleteTaskCount,
    recentTasks,
    recentActivity
  ] = await Promise.all([
    prisma.project.count({ where: accessibleProjectsWhere }),
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: { not: 'COMPLETED' } } }),
    prisma.task.findMany({
      where: { ...taskWhere, status: { not: 'COMPLETED' } },
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

  const groupedStatuses = await prisma.task.groupBy({
    by: ['status'],
    where: taskWhere,
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
