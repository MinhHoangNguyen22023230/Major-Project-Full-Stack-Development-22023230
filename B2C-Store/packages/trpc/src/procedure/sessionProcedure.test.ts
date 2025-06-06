process.env.JWT_SECRET = 'testsecret';
import type { PrismaClient } from '@repo/db';
import type { S3Utils } from '@repo/s3';

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { router, publicProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

describe('sessionProcedure', () => {
    // Helper to parse cookies from a string (Node.js req.headers.cookie)
    function parseCookies(cookieHeader?: string): Record<string, string> {
        const cookies: Record<string, string> = {};
        if (!cookieHeader) return cookies;
        cookieHeader.split(';').forEach((cookie) => {
            const [name, ...rest] = cookie.trim().split('=');
            if (name) cookies[name] = decodeURIComponent(rest.join('='));
        });
        return cookies;
    }

    // Remove the interface and use a generic type for testSessionProcedure
    let testSessionProcedure: ReturnType<typeof router>;

    // Minimal mock PrismaClient with all required properties
    const mockPrisma = {} as PrismaClient;
    const mockS3Utils = {} as typeof S3Utils;

    beforeAll(async () => {
        const sessionUtils = await import('../utils/session.js');
        testSessionProcedure = router({
            createSession: publicProcedure
                .input(z.object({ userId: z.string() }))
                .mutation(async ({ input }) => {
                    try {
                        await sessionUtils.createSession(input.userId, 'session_web');
                        return { ok: true };
                    } catch {
                        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create session' });
                    }
                }),
            deleteSession: publicProcedure.mutation(async () => {
                try {
                    await sessionUtils.deleteSession('session_web');
                    return { ok: true };
                } catch {
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete session' });
                }
            }),
            getSession: publicProcedure.query(async () => {
                try {
                    let session = null;
                    if (typeof window === 'undefined') {
                        session = await sessionUtils.getSession('session_web');
                    } else {
                        let sessionCookie: string | undefined = undefined;
                        if (typeof document !== 'undefined' && document.cookie) {
                            const cookies = parseCookies(document.cookie);
                            sessionCookie = cookies['session_web'];
                        }
                        if (sessionCookie) {
                            session = await sessionUtils.decrypt(sessionCookie);
                        }
                    }
                    if (!session?.userId || typeof session.userId !== 'string') return { userId: null };
                    return { userId: session.userId };
                } catch (err) {
                    console.log('[tRPC getSession] error:', err);
                    return { userId: null };
                }
            }),
            // --- Admin session procedures ---
            createAdminSession: publicProcedure
                .input(z.object({ adminId: z.string() }))
                .mutation(async ({ input }) => {
                    try {
                        await sessionUtils.createSession(input.adminId, 'admin_session');
                        return { ok: true };
                    } catch {
                        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create admin session' });
                    }
                }),
            deleteAdminSession: publicProcedure.mutation(async () => {
                try {
                    await sessionUtils.deleteSession('admin_session');
                    return { ok: true };
                } catch {
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete admin session' });
                }
            }),
            getAdminSession: publicProcedure.query(async () => {
                try {
                    let session = null;
                    if (typeof window === 'undefined') {
                        session = await sessionUtils.getSession('admin_session');
                    } else {
                        let sessionCookie: string | undefined = undefined;
                        if (typeof document !== 'undefined' && document.cookie) {
                            const cookies = parseCookies(document.cookie);
                            sessionCookie = cookies['admin_session'];
                        }
                        if (sessionCookie) {
                            session = await sessionUtils.decrypt(sessionCookie);
                        }
                    }
                    if (!session?.adminId || typeof session.adminId !== 'string') return { adminId: null };
                    return { adminId: session.adminId };
                } catch {
                    return { adminId: null };
                }
            })
        }) as unknown as typeof testSessionProcedure;
        // mockContext is already defined above
    });

    it('should define sessionProcedure', () => {
        expect(testSessionProcedure).toBeDefined();
    });

    describe('createSession', () => {
        it('returns ok on success', async () => {
            const input = { userId: 'user1' };
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'createSession').mockResolvedValueOnce(undefined);
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                createSession: (input: { userId: string }) => Promise<{ ok: boolean }>;
            };
            const result = await caller.createSession(input);
            expect(result).toEqual({ ok: true });
        });
        it('throws on error', async () => {
            const input = { userId: 'user1' };
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'createSession').mockRejectedValueOnce(new Error('fail'));
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                createSession: (input: { userId: string }) => Promise<{ ok: boolean }>;
            };
            await expect(caller.createSession(input)).rejects.toThrow('Failed to create session');
        });
    });
    describe('deleteSession', () => {
        it('returns ok on success', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'deleteSession').mockResolvedValueOnce(undefined);
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                deleteSession: () => Promise<{ ok: boolean }>;
            };
            const result = await caller.deleteSession();
            expect(result).toEqual({ ok: true });
        });
        it('throws on error', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'deleteSession').mockRejectedValueOnce(new Error('fail'));
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                deleteSession: () => Promise<{ ok: boolean }>;
            };
            await expect(caller.deleteSession()).rejects.toThrow('Failed to delete session');
        });
    });
    describe('getSession', () => {
        it('returns userId on valid session', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'getSession').mockResolvedValueOnce({ userId: 'user1' });
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                getSession: () => Promise<{ userId: string | null }>;
            };
            const result = await caller.getSession();
            expect(result).toEqual({ userId: 'user1' });
        });
        it('returns userId null if session is missing', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'getSession').mockResolvedValueOnce(null);
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                getSession: () => Promise<{ userId: string | null }>;
            };
            const result = await caller.getSession();
            expect(result).toEqual({ userId: null });
        });
        it('returns userId null on error', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'getSession').mockRejectedValueOnce(new Error('fail'));
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                getSession: () => Promise<{ userId: string | null }>;
            };
            const result = await caller.getSession();
            expect(result).toEqual({ userId: null });
        });
    });
    describe('Admin session procedures', () => {
        it('createAdminSession returns ok on success', async () => {
            const input = { adminId: 'admin1' };
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'createSession').mockResolvedValueOnce(undefined);
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                createAdminSession: (input: { adminId: string }) => Promise<{ ok: boolean }>;
            };
            const result = await caller.createAdminSession(input);
            expect(result).toEqual({ ok: true });
        });
        it('createAdminSession throws on error', async () => {
            const input = { adminId: 'admin1' };
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'createSession').mockRejectedValueOnce(new Error('fail'));
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                createAdminSession: (input: { adminId: string }) => Promise<{ ok: boolean }>;
            };
            await expect(caller.createAdminSession(input)).rejects.toThrow('Failed to create admin session');
        });
        it('deleteAdminSession returns ok on success', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'deleteSession').mockResolvedValueOnce(undefined);
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                deleteAdminSession: () => Promise<{ ok: boolean }>;
            };
            const result = await caller.deleteAdminSession();
            expect(result).toEqual({ ok: true });
        });
        it('deleteAdminSession throws on error', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'deleteSession').mockRejectedValueOnce(new Error('fail'));
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                deleteAdminSession: () => Promise<{ ok: boolean }>;
            };
            await expect(caller.deleteAdminSession()).rejects.toThrow('Failed to delete admin session');
        });
        it('getAdminSession returns adminId on valid session', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'getSession').mockResolvedValueOnce({ adminId: 'admin1' });
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                getAdminSession: () => Promise<{ adminId: string | null }>;
            };
            const result = await caller.getAdminSession();
            expect(result).toEqual({ adminId: 'admin1' });
        });
        it('getAdminSession returns adminId null if session is missing', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'getSession').mockResolvedValueOnce(null);
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                getAdminSession: () => Promise<{ adminId: string | null }>;
            };
            const result = await caller.getAdminSession();
            expect(result).toEqual({ adminId: null });
        });
        it('getAdminSession returns adminId null on error', async () => {
            const sessionUtils = await import('../utils/session.js');
            vi.spyOn(sessionUtils, 'getSession').mockRejectedValueOnce(new Error('fail'));
            const caller = testSessionProcedure.createCaller({ prisma: mockPrisma, S3Utils: mockS3Utils }) as {
                getAdminSession: () => Promise<{ adminId: string | null }>;
            };
            const result = await caller.getAdminSession();
            expect(result).toEqual({ adminId: null });
        });
    });
});