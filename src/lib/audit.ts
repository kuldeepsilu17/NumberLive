import prisma from './prisma';

interface LogAuditParams {
  adminId?: string | null;
  adminUsername: string;
  action:
    | 'CREATE_RESULT'
    | 'UPDATE_RESULT'
    | 'PUBLISH_RESULT'
    | 'CORRECT_RESULT'
    | 'UNPUBLISH_RESULT'
    | 'DELETE_RESULT'
    | 'CREATE_GAME'
    | 'UPDATE_GAME'
    | 'DELETE_GAME'
    | 'TOGGLE_GAME'
    | 'CREATE_CATEGORY'
    | 'UPDATE_CATEGORY'
    | 'DELETE_CATEGORY'
    | 'CREATE_FAQ'
    | 'UPDATE_FAQ'
    | 'DELETE_FAQ'
    | 'UPDATE_SEO'
    | 'UPDATE_CONTENT'
    | 'UPDATE_SETTING'
    | string;
  gameId?: string | null;
  gameName?: string | null;
  targetDate?: string | null;
  oldResult?: string | null;
  newResult?: string | null;
  reasonNote?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function recordAuditLog(params: LogAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        adminUsername: params.adminUsername,
        action: params.action,
        gameId: params.gameId,
        gameName: params.gameName,
        targetDate: params.targetDate,
        oldResult: params.oldResult,
        newResult: params.newResult,
        reasonNote: params.reasonNote,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
}
