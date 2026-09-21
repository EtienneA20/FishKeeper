import { NextResponse } from 'next/server';

import { prisma } from '../../../lib/db';

interface UserPayload {
    name?: unknown;
    email?: unknown;
}

const getUserPayload = async (request: Request): Promise<UserPayload> =>
    (await request.json()) as UserPayload;

const validatePayload = (payload: UserPayload): { name: string; email: string } | null => {
    if (
        typeof payload.name !== 'string' ||
        typeof payload.email !== 'string' ||
        payload.name.trim().length < 2 ||
        !payload.email.includes('@')
    ) {
        return null;
    }

    return {
        name: payload.name.trim(),
        email: payload.email.trim(),
    };
};

export async function GET(): Promise<NextResponse> {
    const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(users);
}

export async function POST(request: Request): Promise<NextResponse> {
    const values = validatePayload(await getUserPayload(request));

    if (!values) {
        return NextResponse.json(
            { message: 'Les données utilisateur sont invalides.' },
            { status: 400 },
        );
    }

    const user = await prisma.user.create({ data: values });
    return NextResponse.json(user, { status: 201 });
}

export async function PUT(request: Request): Promise<NextResponse> {
    const payload = (await request.json()) as UserPayload & { id?: unknown };
    const values = validatePayload(payload);

    if (typeof payload.id !== 'string' || !values) {
        return NextResponse.json(
            { message: 'Les données utilisateur sont invalides.' },
            { status: 400 },
        );
    }

    const user = await prisma.user.update({
        where: { id: payload.id },
        data: values,
    });

    return NextResponse.json(user);
}

export async function DELETE(request: Request): Promise<NextResponse> {
    const payload = (await request.json()) as { id?: unknown };

    if (typeof payload.id !== 'string') {
        return NextResponse.json(
            { message: "L'identifiant utilisateur est obligatoire." },
            { status: 400 },
        );
    }

    await prisma.user.delete({ where: { id: payload.id } });
    return new NextResponse(null, { status: 204 });
}