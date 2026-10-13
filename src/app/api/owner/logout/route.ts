import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdmin, OWNER_COOKIE_NAME, COOKIE_NAME } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAdmin();

    if (session) {
      await recordAuditLog({
        adminId: session.id,
        adminUsername: session.username,
        action: 'OWNER_LOGOUT',
        reasonNote: 'Owner logged out of management panel',
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Browser',
      });
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    // Clear cookies
    response.cookies.delete(OWNER_COOKIE_NAME);
    response.cookies.delete(COOKIE_NAME);

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
