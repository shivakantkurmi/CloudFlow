import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export const requireOrgRole = (allowedRoles) => async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.body.organizationId || req.query.organizationId;
    if (!orgId) {
      return next(new AppError('Organization ID is required', 400));
    }

    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: req.user.id,
        },
      },
    });

    if (!member) {
      return next(new AppError('You are not a member of this organization', 403));
    }

    if (!allowedRoles.includes(member.role)) {
      return next(new AppError(`Requires one of roles: ${allowedRoles.join(', ')}`, 403));
    }

    // Attach org role to request for later use
    req.orgRole = member.role;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireProjectRole = (allowedRoles) => async (req, res, next) => {
  try {
    let projectId = req.params.projectId || req.body.projectId || req.query.projectId;
    const taskId = req.params.taskId || req.params.id; // nested task routes use id as taskId

    // In task/comment/attachment routes mounted under /api/tasks/:taskId, projectId is not in URL
    // So we fetch it via taskId
    if (!projectId && taskId) {
      // It might be a task id, let's see if we can find a task
      const task = await prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
      if (task) {
        projectId = task.projectId;
      }
    }

    if (!projectId) {
      // Last resort: If the route is literally /api/projects/:id, then req.params.id is the project id
      // Ensure we don't accidentally treat a taskId as a projectId if it's not a task route
      projectId = req.params.id;
    }

    if (!projectId) {
      return next(new AppError('Project ID could not be determined', 400));
    }

    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
      include: {
        project: {
          select: { organizationId: true },
        },
      },
    });

    if (!projectMember) {
      // If not a project member, check if they are an Org Admin/Owner
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return next(new AppError('Project not found', 404));
      }
      
      const orgMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: { organizationId: project.organizationId, userId: req.user.id }
        }
      });
      
      if (orgMember && ['OWNER', 'ADMIN'].includes(orgMember.role)) {
        // Org Admins have implicit PROJECT_MANAGER role
        req.projectRole = 'PROJECT_MANAGER';
        return next();
      }

      return next(new AppError('You are not a member of this project', 403));
    }

    // Check if their explicit project role is allowed
    // Also Org Owner/Admin overrides
    const orgMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: projectMember.project.organizationId, userId: req.user.id }
      }
    });

    const isOrgAdmin = orgMember && ['OWNER', 'ADMIN'].includes(orgMember.role);
    
    if (!isOrgAdmin && !allowedRoles.includes(projectMember.role)) {
      return next(new AppError(`Requires one of project roles: ${allowedRoles.join(', ')}`, 403));
    }

    req.projectRole = isOrgAdmin ? 'PROJECT_MANAGER' : projectMember.role;
    next();
  } catch (error) {
    next(error);
  }
};
