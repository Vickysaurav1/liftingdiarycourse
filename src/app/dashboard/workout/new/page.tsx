import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewWorkoutForm from "./new-workout-form";

export default async function NewWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black">
        <Card className="bg-white dark:bg-zinc-950">
          <CardContent className="pt-6 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Please sign in to log a workout.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Log New Workout</h1>
        <Card className="bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent>
            <NewWorkoutForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
