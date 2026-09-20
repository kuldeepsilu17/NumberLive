import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('all') === 'true';
    const categorySlug = searchParams.get('category');

    const where: any = {};
    if (!includeInactive) where.isActive = true;
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const games = await prisma.game.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        category: true,
        _count: {
          select: { results: true },
        },
      },
    });

    return NextResponse.json({ success: true, games });
  } catch (error: any) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, resultTime, description, categoryId, isActive, sortOrder, seoTitle, seoDescription } = body;

    if (!name || !slug || !resultTime) {
      return NextResponse.json(
        { error: 'Game name, slug, and result time are required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const existing = await prisma.game.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A game with slug '${cleanSlug}' already exists` },
        { status: 409 }
      );
    }

    const game = await prisma.game.create({
      data: {
        name,
        slug: cleanSlug,
        resultTime,
        categoryId: categoryId || null,
        description: description || '',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
      include: { category: true },
    });

    await recordAuditLog({
      adminId: admin.id,
      adminUsername: admin.username,
      action: 'CREATE_GAME',
      gameId: game.id,
      gameName: game.name,
      reasonNote: `Created new game: ${game.name} scheduled for ${game.resultTime}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, game }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, slug, resultTime, description, categoryId, isActive, sortOrder, seoTitle, seoDescription } = body;

    if (!id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const existingGame = await prisma.game.findUnique({ where: { id } });
    if (!existingGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const updated = await prisma.game.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingGame.name,
        slug: slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') : existingGame.slug,
        resultTime: resultTime !== undefined ? resultTime : existingGame.resultTime,
        categoryId: categoryId !== undefined ? categoryId : existingGame.categoryId,
        description: description !== undefined ? description : existingGame.description,
        isActive: isActive !== undefined ? Boolean(isActive) : existingGame.isActive,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existingGame.sortOrder,
        seoTitle: seoTitle !== undefined ? seoTitle : existingGame.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : existingGame.seoDescription,
      },
      include: { category: true },
    });

    await recordAuditLog({
      adminId: admin.id,
      adminUsername: admin.username,
      action: 'UPDATE_GAME',
      gameId: updated.id,
      gameName: updated.name,
      reasonNote: `Updated game settings for ${updated.name}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, game: updated });
  } catch (error: any) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    await prisma.game.delete({ where: { id } });

    await recordAuditLog({
      adminId: admin.id,
      adminUsername: admin.username,
      action: 'DELETE_GAME',
      gameId: id,
      gameName: game.name,
      reasonNote: `Deleted game: ${game.name}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, message: 'Game deleted' });
  } catch (error: any) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
