import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
    const { userId } = await req.json();
    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    await createSession(userId);
    return NextResponse.json({ ok: true });
}