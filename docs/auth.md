# Auth Coding Standards

This document outlines the coding standards for authentication throughout this project.

## Auth Provider

**This app uses [Clerk](https://clerk.com) for all authentication.** No other auth libraries or custom auth solutions should be used.

All Clerk imports must come from:
- `@clerk/nextjs` — for client-side components and providers
- `@clerk/nextjs/server` — for server-side auth utilities and middleware

## Setup

### ClerkProvider

The `<ClerkProvider>` must wrap the entire application. It is configured once in the root layout (`src/app/layout.tsx`) and must not be added elsewhere.

```typescript
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### Middleware

Clerk middleware must be configured in `src/middleware.ts` using `clerkMiddleware`. This ensures Clerk can intercept requests for auth state.

```typescript
// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## Getting the Current User

### In Server Components

Use `auth()` from `@clerk/nextjs/server` to get the current user's ID. This is an async function — always `await` it.

```typescript
// ✅ CORRECT — server component
import { auth } from "@clerk/nextjs/server";

export default async function MyPage() {
  const { userId } = await auth();

  if (!userId) {
    // Handle unauthenticated state
  }

  // userId is now safe to use
}
```

### ❌ Prohibited

- Do NOT use `getAuth()`, `useUser()`, or any other Clerk helper in server components
- Do NOT call `auth()` in client components — it is server-only
- Do NOT pass `userId` down from a parent layout to children via props — each server component that needs it should call `auth()` directly

## UI: Sign In, Sign Up, and User Controls

Use Clerk's built-in UI components for all auth-related UI. Do not build custom sign-in/sign-up flows.

| Need | Component | Import |
|---|---|---|
| Sign in button | `<SignInButton>` | `@clerk/nextjs` |
| Sign up button | `<SignUpButton>` | `@clerk/nextjs` |
| User profile/avatar | `<UserButton>` | `@clerk/nextjs` |
| Conditional rendering | `<Show when="signed-in">` / `<Show when="signed-out">` | `@clerk/nextjs` |

```typescript
// ✅ CORRECT — conditional auth UI
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header>
      <Show when="signed-out">
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  );
}
```

## Handling Unauthenticated Users

When a server component requires authentication, check `userId` immediately after calling `auth()` and return early with a message if the user is not signed in. Do not redirect — show an inline message.

```typescript
// ✅ CORRECT
const { userId } = await auth();

if (!userId) {
  return (
    <div>
      <p>Please sign in to view this page.</p>
    </div>
  );
}
```

## The userId

The `userId` returned by Clerk's `auth()` is the canonical identifier for a user throughout this app. It is a string (e.g. `"user_2abc..."`).

- **Always** use `userId` from Clerk as the `userId` stored in the database
- **Never** create or manage your own user ID system
- All database records that belong to a user must store this `userId` — see `/docs/data-fetching.md` for enforcement rules

## Summary

| Requirement | Rule |
|---|---|
| Auth provider | Clerk only — no custom auth |
| Client imports | `@clerk/nextjs` |
| Server imports | `@clerk/nextjs/server` |
| Get current user (server) | `const { userId } = await auth()` |
| Auth UI components | `SignInButton`, `SignUpButton`, `UserButton`, `Show` |
| Unauthenticated handling | Return early with an inline message |
| User identifier | Always use Clerk's `userId` string |
