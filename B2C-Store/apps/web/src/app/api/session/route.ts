import { NextRequest, NextResponse } from "next/server";
import { createSession, decrypt } from "@/lib/session";

export async function POST(req: NextRequest) {
    const { userId } = await req.json();
    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    await createSession(userId);
    return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
    const sessionCookie = req.cookies.get("session")?.value;
    if (!sessionCookie) {
        return NextResponse.json({ user: null });
    }

    const session = await decrypt(sessionCookie);
    if (!session?.userId) {
        return NextResponse.json({ user: null });
    }
    console.log("api/session/route.ts:", session.userId);
    return NextResponse.json({ userId: session.userId });
}