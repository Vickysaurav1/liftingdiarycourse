# Data Fetching Standards

## Critical Rules

**ALL data fetching within this app MUST be done via server components. This is not optional.**

### ❌ Prohibited Data Fetching Methods

- ❌ Route handlers (`src/app/api/`)
- ❌ Client components (`'use client'`)
- ❌ Any other method except server components

### ✅ Correct Approach: Server Components Only

Data fetching must happen in server components (the default in Next.js 16+). Server components have direct access to the database and can securely fetch and filter data.

## Database Queries

All database queries must follow this pattern:

### ✅ Correct: Use Helper Functions with Drizzle ORM

1. **Create helper functions** in `/src/data/` directory
2. **Use Drizzle ORM** exclusively — NO raw SQL
3. **Verify user ownership** before returning data

**Example helper function:**

```typescript
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getUserWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  
  return workout;
}
```

**Example server component:**

```typescript
// src/app/dashboard/page.tsx
import { getSession } from '@/auth';
import { getUserWorkouts } from '@/data/workouts';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    // Handle unauthorized
  }
  
  const workouts = await getUserWorkouts(session.user.id);
  
  return (
    <div>
      {workouts.map(workout => (
        <div key={workout.id}>{workout.name}</div>
      ))}
    </div>
  );
}
```

## Data Access Control

### ⚠️ CRITICAL: User Data Isolation

**Every database query MUST verify the requesting user owns the data they're requesting.**

This means:
1. Always include the `userId` in the WHERE clause
2. Never return data where `userId !== requestingUserId`
3. Verify user identity from the session before querying
4. If a user tries to access another user's data, return an error or empty result

**Example of secure data access:**

```typescript
export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId)  // ← User ownership check
    ));
  
  if (!workout) {
    return null; // User doesn't own this data
  }
  
  return workout;
}
```

**Example of INSECURE code (DO NOT DO THIS):**

```typescript
// ❌ WRONG: No user ownership check
export async function getWorkoutById(workoutId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId));
  
  return workout; // Anyone can access any workout!
}

// ❌ WRONG: Fetching from client component
'use client';
export default function WorkoutPage() {
  const [workout, setWorkout] = useState(null);
  
  useEffect(() => {
    fetch('/api/workout/123') // ← Fetching from client
      .then(res => res.json())
      .then(data => setWorkout(data));
  }, []);
}

// ❌ WRONG: Using raw SQL instead of Drizzle
export async function getWorkout(id: string) {
  const result = await db.query(`SELECT * FROM workouts WHERE id = '${id}'`); // ← Raw SQL and SQL injection risk!
  return result;
}
```

## Summary

| Requirement | Details |
|---|---|
| **Where?** | Server components only |
| **How?** | Drizzle ORM helper functions in `/src/data/` |
| **What?** | No raw SQL, no client-side fetching, no route handlers |
| **Security** | Always filter by `userId` — users can ONLY access their own data |
