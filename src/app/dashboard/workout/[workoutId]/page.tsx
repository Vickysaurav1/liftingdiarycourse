import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./edit-workout-form";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black">
        <Card className="bg-white dark:bg-zinc-950">
          <CardContent className="pt-6 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Please sign in to edit a workout.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId, userId);

  if (!workout) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Edit Workout</h1>
        <Card className="bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent>
            <EditWorkoutForm
              workoutId={workout.id}
              initialName={workout.name}
              initialDate={new Date(workout.date)}
              initialStartedAt={new Date(workout.startedAt)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
