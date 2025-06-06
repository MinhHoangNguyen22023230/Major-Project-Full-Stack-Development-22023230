import { describe, it, expect } from 'vitest';
import { createContext } from './context';
import { prisma } from '@repo/db';
import { S3Utils } from '@repo/s3';

describe('createContext', () => {
    it('returns the correct context object', () => {
        const ctx = createContext();
        expect(ctx).toEqual({ prisma, S3Utils });
    });
});
