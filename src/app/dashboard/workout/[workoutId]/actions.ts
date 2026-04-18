'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { updateWorkout } from '@/data/workouts';

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(params: {
  workoutId: string;
  name: string;
  date: string;
  startedAt: Date;
}): Promise<{ date: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = updateWorkoutSchema.parse(params);
  const workout = await updateWorkout(
    parsed.workoutId,
    userId,
    parsed.name,
    parsed.date,
    parsed.startedAt
  );

  return { date: workout.date };
}
