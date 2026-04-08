"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

interface DatePickerClientProps {
  selectedDate: Date;
}

export default function DatePickerClient({ selectedDate }: DatePickerClientProps) {
  const router = useRouter();
  const [date, setDate] = useState<Date>(selectedDate);
  const [open, setOpen] = useState(false);
  const formattedDate = format(date, "do MMM yyyy", { locale: enUS });

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, "0");
      const day = String(newDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      setOpen(false);
      router.push(`/dashboard?date=${dateStr}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon className="w-4 h-4" />
          {formattedDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) =>
            date > new Date() || date < new Date("2020-01-01")
          }
        />
      </PopoverContent>
    </Popover>
  );
}
