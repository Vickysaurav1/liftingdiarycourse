# Server Component Standards

## Next.js 15: Params Are a Promise

In Next.js 15, dynamic route params are **asynchronous**. The `params` prop is a `Promise` and **must be awaited** before accessing any values.

### ✅ Correct

```typescript
interface PageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function WorkoutPage({ params }: PageProps) {
  const { workoutId } = await params;
  // use workoutId
}
```

### ❌ Wrong

```typescript
// ❌ WRONG: params typed as a plain object
interface PageProps {
  params: { workoutId: string };
}

// ❌ WRONG: destructuring params without awaiting
export default async function WorkoutPage({ params }: PageProps) {
  const { workoutId } = params; // runtime error in Next.js 15
}
```

### Also applies to `searchParams`

`searchParams` follows the same rule — it is also a Promise in Next.js 15.

```typescript
interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { date } = await searchParams;
}
```

---

## Server Component Rules

- All page components (`page.tsx`) must be `async` functions
- Never use React hooks (`useState`, `useEffect`, etc.) in server components — move interactive logic to a separate `"use client"` component
- Never import client-only libraries (e.g. `useRouter`, browser APIs) in server components
- Data fetching happens directly in the server component body — no `useEffect`, no `fetch` in client components for initial data
- Auth is retrieved via `const { userId } = await auth()` from `@clerk/nextjs/server` — see `/docs/auth.md`
