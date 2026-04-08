import { db } from '@/db';
import { workouts, workoutExercises, sets, exercises } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Fetches all workouts for a user on a specific date.
 * Includes related exercise and set data.
 *
 * @param userId - The ID of the user (from Clerk)
 * @param date - The date to fetch workouts for (ISO date string: YYYY-MM-DD)
 * @returns Array of workouts with exercises and sets
 */
export async function getUserWorkoutsByDate(userId: string, date: string) {
  const userWorkouts = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)));

  // Fetch exercises and sets for each workout
  const workoutsWithDetails = await Promise.all(
    userWorkouts.map(async (workout) => {
      const exercisesData = await db
        .select({
          workoutExercise: workoutExercises,
          exercise: exercises,
          sets: sets,
        })
        .from(workoutExercises)
        .innerJoin(
          exercises,
          eq(workoutExercises.exerciseId, exercises.id)
        )
        .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
        .where(eq(workoutExercises.workoutId, workout.id));

      // Group sets by workout exercise
      const groupedExercises = exercisesData.reduce(
        (acc, item) => {
          const workoutExerciseId = item.workoutExercise.id;
          const existing = acc.find(
            (e) => e.workoutExercise.id === workoutExerciseId
          );

          if (existing) {
            if (item.sets) {
              existing.sets.push(item.sets);
            }
          } else {
            acc.push({
              workoutExercise: item.workoutExercise,
              exercise: item.exercise,
              sets: item.sets ? [item.sets] : [],
            });
          }

          return acc;
        },
        [] as typeof exercisesData
      );

      return {
        ...workout,
        exercises: groupedExercises,
      };
    })
  );

  return workoutsWithDetails;
}

/**
 * Fetches a specific workout by ID, verifying user ownership.
 *
 * @param workoutId - The ID of the workout
 * @param userId - The ID of the user (from Clerk)
 * @returns The workout or null if not found or user doesn't own it
 */
export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout || null;
}
