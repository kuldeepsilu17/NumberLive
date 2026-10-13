import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionAdmin, hashPassword, isOwnerRole } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Owner session required.' }, { status: 401 });
    }

    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Owner session required.' }, { status: 401 });
    }

    const body = await req.json();
    const { email, username, name, password, role } = body;

    if (!email || !username || !password || !name) {
      return NextResponse.json(
        { error: 'Email, username, full name, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    // Check duplicate
    const existing = await prisma.adminUser.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email or username already exists.' },
        { status: 409 }
      );
    }

    // Role validation: Enforce Single Owner policy
    let targetRole = (role || 'ADMIN').toUpperCase().trim();
    if (targetRole === 'OWNER') {
      // Check how many owners currently exist
      const ownerCount = await prisma.adminUser.count({
        where: { role: 'OWNER' },
      });
      if (ownerCount >= 1 && !isOwnerRole(session.role)) {
        return NextResponse.json(
          { error: 'There can only be one primary system owner. New accounts should use ADMIN or EDITOR role.' },
          { status: 403 }
        );
      }
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.adminUser.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        name: name.trim(),
        passwordHash,
        role: targetRole,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    await recordAuditLog({
      adminId: session.id,
      adminUsername: session.username,
      action: 'USER_CREATED',
      reasonNote: `Created staff account: ${newUser.username} (${newUser.role})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Owner session required.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, email, role, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (role) {
      const newRole = role.toUpperCase().trim();
      // If demoting an owner, ensure at least one owner remains
      if (existing.role === 'OWNER' && newRole !== 'OWNER') {
        const ownerCount = await prisma.adminUser.count({ where: { role: 'OWNER' } });
        if (ownerCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot demote the sole system owner.' },
            { status: 400 }
          );
        }
      }
      updateData.role = newRole;
    }
    if (password && password.trim().length >= 8) {
      updateData.passwordHash = await hashPassword(password.trim());
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    await recordAuditLog({
      adminId: session.id,
      adminUsername: session.username,
      action: 'USER_UPDATED',
      reasonNote: `Updated user account: ${existing.username}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Owner session required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    if (id === session.id) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (existing.role === 'OWNER') {
      const ownerCount = await prisma.adminUser.count({ where: { role: 'OWNER' } });
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the primary system owner account.' },
          { status: 400 }
        );
      }
    }

    await prisma.adminUser.delete({ where: { id } });

    await recordAuditLog({
      adminId: session.id,
      adminUsername: session.username,
      action: 'USER_DELETED',
      reasonNote: `Deleted staff account: ${existing.username} (${existing.role})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
