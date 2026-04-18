# Data Mutation Standards

## Critical Rules

**ALL data mutations within this app MUST follow these rules. None of these are optional.**

### ❌ Prohibited Mutation Methods

- ❌ Direct `db` calls inside server components, route handlers, or client components
- ❌ Route handlers (`src/app/api/`) for mutations
- ❌ Server actions that accept `FormData` as a parameter type
- ❌ Server actions without Zod validation
- ❌ Inline db calls — always go through a helper in `/src/data/`

### ✅ Required Approach

1. **Helper functions** in `/src/data/` wrap all Drizzle ORM calls
2. **Server actions** in colocated `actions.ts` files call those helpers
3. **Zod schemas** validate all server action arguments before any db call

---

## Layer 1: Data Helpers (`/src/data/`)

All Drizzle ORM mutation calls (insert, update, delete) must live in helper functions inside `/src/data/`. These functions receive plain typed arguments — they do not validate, that is the server action's job.

**Example:**

```typescript
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createWorkout(userId: string, name: string, date: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();

  return workout;
}

export async function updateWorkout(
  workoutId: string,
  userId: string,
  name: string
) {
  const [workout] = await db
    .update(workouts)
    .set({ name })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  return workout;
}

export async function deleteWorkout(workoutId: string, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

### User Ownership on Mutations

Every update and delete helper **MUST** include `userId` in the `WHERE` clause. Never mutate a row without verifying the requesting user owns it.

---

## Layer 2: Server Actions (`actions.ts`)

Server actions must be defined in a file named `actions.ts` colocated with the route or feature they serve. They must:

1. Be marked with `'use server'`
2. Accept typed parameters — **never `FormData`**
3. Validate all arguments with a Zod schema before doing anything else
4. Get the current user from Clerk and pass `userId` to data helpers
5. Call helpers from `/src/data/` — never call `db` directly

**Example:**

```typescript
// src/app/dashboard/workouts/actions.ts
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createWorkout, updateWorkout, deleteWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
});

const deleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

export async function createWorkoutAction(params: {
  name: string;
  date: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = createWorkoutSchema.parse(params);
  return createWorkout(userId, parsed.name, parsed.date);
}

export async function updateWorkoutAction(params: {
  workoutId: string;
  name: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = updateWorkoutSchema.parse(params);
  return updateWorkout(parsed.workoutId, userId, parsed.name);
}

export async function deleteWorkoutAction(params: { workoutId: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = deleteWorkoutSchema.parse(params);
  return deleteWorkout(parsed.workoutId, userId);
}
```

---

## What Goes Where

| Concern | Location |
|---|---|
| Drizzle ORM calls (insert/update/delete) | `/src/data/*.ts` helper functions |
| Business logic, auth checks, validation | `actions.ts` server actions |
| Triggering mutations from UI | Client components call server actions directly |

---

## Common Mistakes

```typescript
// ❌ WRONG: FormData parameter
export async function createWorkoutAction(formData: FormData) { ... }

// ❌ WRONG: No Zod validation
export async function createWorkoutAction(params: { name: string }) {
  const { userId } = await auth();
  return createWorkout(userId, params.name); // params.name is unvalidated
}

// ❌ WRONG: Direct db call inside a server action
export async function createWorkoutAction(params: { name: string }) {
  const { userId } = await auth();
  await db.insert(workouts).values({ userId, name: params.name }); // bypass /src/data/
}

// ❌ WRONG: Mutation from a server component (not a server action)
export default async function WorkoutsPage() {
  await db.insert(workouts).values({ ... }); // mutations belong in server actions
}

// ❌ WRONG: Using redirect() inside a server action
export async function createWorkoutAction(params: { name: string; date: Date }) {
  const { userId } = await auth();
  const workout = await createWorkout(userId, params.name, params.date);
  redirect(`/dashboard?date=${workout.date}`); // redirects must not happen in server actions
}

// ✅ CORRECT: Return data from the server action, redirect client-side
// actions.ts
export async function createWorkoutAction(params: { name: string; date: Date }) {
  const { userId } = await auth();
  const workout = await createWorkout(userId, params.name, params.date);
  return { date: workout.date }; // return data needed for redirect
}

// client component
const { date } = await createWorkoutAction(params);
router.push(`/dashboard?date=${date}`); // redirect happens client-side
```

---

## Summary

| Requirement | Rule |
|---|---|
| **Where are db calls?** | `/src/data/` helper functions only |
| **Where are mutations triggered?** | `actions.ts` server actions, colocated with the route |
| **Parameter types** | Typed TypeScript params — never `FormData` |
| **Validation** | Every server action must validate params with Zod before use |
| **Auth** | Get `userId` from Clerk in the server action; pass it to helpers |
| **User isolation** | Every update/delete helper must filter by `userId` |
| **Redirects** | Never call `redirect()` inside a server action — return data and redirect client-side via `router.push` |
