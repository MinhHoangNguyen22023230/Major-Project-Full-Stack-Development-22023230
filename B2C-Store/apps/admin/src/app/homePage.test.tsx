import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}))

vi.mock('@/app/_trpc/client', () => ({
  trpc: {
    adminLog: {
      useMutation: () => ({
        mutateAsync: vi.fn(),
        status: 'idle',
      }),
    },
    adminSession: {
      createAdminSession: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
          status: 'idle',
        }),
      },
    },
  },
}))

test('Page renders LoginForm', () => {
  render(<Page />)
  // Check for the submit button rendered by LoginForm
  expect(screen.getByRole('button', { name: /sign in/i })).not.toBeUndefined();
})