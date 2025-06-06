import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';

// Top-level mock references
let signMock: ReturnType<typeof vi.fn>;
let SignJWTMock: ReturnType<typeof vi.fn>;
let jwtVerifyMock: ReturnType<typeof vi.fn>;
let cookiesMock: ReturnType<typeof vi.fn>;

// All mock declarations must be inside the vi.mock factory to avoid hoisting issues
vi.mock('next/headers', () => {
    cookiesMock = vi.fn();
    return {
        cookies: cookiesMock,
    };
});
vi.mock('jose', () => {
    signMock = vi.fn().mockResolvedValue('mocked.jwt.token');
    SignJWTMock = vi.fn(function () {
        return {
            setProtectedHeader: vi.fn().mockReturnThis(),
            setIssuedAt: vi.fn().mockReturnThis(),
            setExpirationTime: vi.fn().mockReturnThis(),
            sign: signMock,
        };
    });
    jwtVerifyMock = vi.fn();
    return {
        SignJWT: SignJWTMock,
        jwtVerify: jwtVerifyMock,
    };
});

type SessionPayload = { userId: string; expiresAt: Date };

let sessionUtils: typeof import('./session');

beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    sessionUtils = await import('./session.js');
});

beforeEach(() => {
    cookiesMock.mockReset();
    jwtVerifyMock.mockReset();
    signMock.mockReset().mockResolvedValue('mocked.jwt.token');
});
afterEach(() => {
    vi.clearAllMocks();
});
afterAll(() => {
    delete process.env.JWT_SECRET;
});

describe('session utils', () => {
    it('createSession sets a cookie with a JWT', async () => {
        const set = vi.fn();
        cookiesMock.mockResolvedValue({ set });
        await sessionUtils.createSession('user123', 'test_cookie');
        expect(set).toHaveBeenCalledWith(
            'test_cookie',
            'mocked.jwt.token',
            expect.objectContaining({ httpOnly: true, secure: true })
        );
    });

    it('deleteSession deletes the cookie', async () => {
        const del = vi.fn();
        cookiesMock.mockResolvedValue({ delete: del });
        await sessionUtils.deleteSession('test_cookie');
        expect(del).toHaveBeenCalledWith('test_cookie');
    });

    it('encrypt returns a JWT string', async () => {
        const payload: SessionPayload = { userId: 'u', expiresAt: new Date() };
        const jwt = await sessionUtils.encrypt(payload);
        expect(typeof jwt).toBe('string');
        expect(jwt).toBe('mocked.jwt.token');
    });

    it('decrypt returns payload on valid JWT', async () => {
        const mockPayload = { userId: 'u', expiresAt: new Date().toISOString() };
        jwtVerifyMock.mockResolvedValue({ payload: mockPayload });
        const result = await sessionUtils.decrypt('valid.jwt.token');
        expect(result).toEqual(mockPayload);
    });

    it('decrypt returns null on invalid JWT', async () => {
        jwtVerifyMock.mockRejectedValue(new Error('bad token'));
        const result = await sessionUtils.decrypt('bad.jwt.token');
        expect(result).toBeNull();
    });

    it('decrypt returns null if session is undefined or empty', async () => {
        const result1 = await sessionUtils.decrypt(undefined);
        const result2 = await sessionUtils.decrypt('');
        expect(result1).toBeNull();
        expect(result2).toBeNull();
    });

    it('getSession returns null if no cookie is set', async () => {
        cookiesMock.mockResolvedValue({ get: () => undefined });
        const result = await sessionUtils.getSession('test_cookie');
        expect(result).toBeNull();
    });

    it('getSession returns decrypted payload if cookie is set', async () => {
        const cookieValue = 'valid.jwt.token';
        cookiesMock.mockResolvedValue({ get: () => ({ value: cookieValue }) });
        jwtVerifyMock.mockResolvedValue({ payload: { userId: 'u', expiresAt: new Date().toISOString() } });
        const result = await sessionUtils.getSession('test_cookie');
        expect(result).toMatchObject({ userId: 'u' });
    });

    it('throws if JWT_SECRET is not set', async () => {
        process.env.JWT_SECRET = '';
        vi.resetModules();
        await expect(import('./session.ts')).rejects.toThrow('Environment variable JWT_SECRET is not defined.');
    });
});
