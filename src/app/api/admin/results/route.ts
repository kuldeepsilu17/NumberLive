import { NextRequest, NextResponse } from 'next/server';
import { POST as handleResultsPOST, PUT as handleResultsPUT, DELETE as handleResultsDELETE, GET as handleResultsGET } from '../..//results/route';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleResultsGET(req);
}

export async function POST(req: NextRequest) {
  return handleResultsPOST(req);
}

export async function PUT(req: NextRequest) {
  return handleResultsPUT(req);
}

export async function DELETE(req: NextRequest) {
  return handleResultsDELETE(req);
}
