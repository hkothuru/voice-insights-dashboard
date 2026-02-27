import { NextResponse } from 'next/server';
import { getCalls } from '@/lib/db';

export async function GET() {
    const calls = getCalls();
    return NextResponse.json(calls);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (action === 'reset') {
        const { clearCalls } = await import('@/lib/db');
        clearCalls();
        return NextResponse.json({ message: 'All calls cleared' });
    }

    if (id) {
        const { deleteCall } = await import('@/lib/db');
        deleteCall(id);
        return NextResponse.json({ message: 'Call deleted' });
    }

    return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
}
