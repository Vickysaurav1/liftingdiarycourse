'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name: string;
  date: string;
  startedAt: Date;
}): Promise<{ date: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = createWorkoutSchema.parse(params);
  const workout = await createWorkout(userId, parsed.name, parsed.date, parsed.startedAt);

  return { date: workout.date };
}
