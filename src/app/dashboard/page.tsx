export const dynamic = 'force-dynamic';

import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { getUserWorkoutsByDate } from "@/data/workouts";
import DatePickerClient from "./date-picker";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black">
        <Card className="bg-white dark:bg-zinc-950">
          <CardContent className="pt-6 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Please sign in to view your workouts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the selected date from searchParams or default to today
  const params = await searchParams;
  let selectedDateStr = params.date;

  if (!selectedDateStr) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    selectedDateStr = `${year}-${month}-${day}`;
  }

  const selectedDate = parseISO(selectedDateStr);
  const formattedDate = format(selectedDate, "do MMM yyyy", { locale: enUS });

  // Fetch workouts for the selected date
  const workouts = await getUserWorkoutsByDate(userId, selectedDateStr);

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 bg-zinc-50 dark:bg-black">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Workout Log</h1>
        <DatePickerClient selectedDate={selectedDate} />
      </div>

      <div className="grid gap-6 max-w-4xl">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <Card key={workout.id} className="bg-white dark:bg-zinc-950">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5" />
                    {workout.name}
                  </CardTitle>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {format(new Date(workout.startedAt), "h:mm a")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {workout.exercises.length > 0 ? (
                  <div className="space-y-4">
                    {workout.exercises.map((item) => (
                      <div key={item.workoutExercise.id}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{item.exercise.name}</p>
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {item.sets.length} sets
                          </span>
                        </div>
                        <div className="space-y-2">
                          {item.sets.map((set) => (
                            <div
                              key={set.id}
                              className="flex items-center gap-6 pb-2"
                            >
                              <div className="flex-1">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                  Set {set.setNumber}
                                </p>
                                {set.reps && (
                                  <p className="text-lg font-semibold">
                                    {set.reps} reps
                                  </p>
                                )}
                              </div>
                              {set.weightLbs && (
                                <div className="flex-1">
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Weight
                                  </p>
                                  <p className="text-lg font-semibold">
                                    {set.weightLbs} lbs
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No exercises logged yet.
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Card className="bg-white dark:bg-zinc-950 w-full">
              <CardContent className="pt-6 text-center text-zinc-500 dark:text-zinc-400">
                <p>No workouts logged for {formattedDate}</p>
              </CardContent>
            </Card>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
              Log Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
