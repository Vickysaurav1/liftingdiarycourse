"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createWorkoutAction } from "./actions";

export default function NewWorkoutForm() {
  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>(
    format(new Date(), "HH:mm")
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const formattedDate = format(date, "do MMM yyyy", { locale: enUS });

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const [hours, minutes] = startTime.split(":").map(Number);
    const startedAt = new Date(date);
    startedAt.setHours(hours, minutes, 0, 0);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    startTransition(async () => {
      const { date: workoutDate } = await createWorkoutAction({ name, date: dateStr, startedAt });
      router.push(`/dashboard?date=${workoutDate}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Push Day, Leg Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              {formattedDate}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                  setCalendarOpen(false);
                }
              }}
              disabled={(d) =>
                d > new Date() || d < new Date("2020-01-01")
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? "Logging..." : "Log Workout"}
      </Button>
    </form>
  );
}
