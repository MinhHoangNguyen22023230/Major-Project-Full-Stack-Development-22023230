import { NextRequest, NextResponse } from "next/server";
import { createSession, decrypt } from "@/lib/session";

export async function POST(req: NextRequest) {
    const { adminId } = await req.json();
    if (!adminId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    await createSession(adminId);
    return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
    const sessionCookie = req.cookies.get("session")?.value;
    if (!sessionCookie) {
        return NextResponse.json({ admin: null });
    }

    const session = await decrypt(sessionCookie);
    if (!session?.adminId) {
        return NextResponse.json({ admin: null });
    }
    console.log("api/session/route.ts:", session.adminId);
    return NextResponse.json({ adminId: session.adminId });
}