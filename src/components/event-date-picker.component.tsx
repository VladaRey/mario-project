import { FC } from "react";
import { Label } from "./ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface EventDatePickerProps {
  date: Date;
  setDate: (date: Date | undefined) => void;
}

export const EventDatePicker: FC<EventDatePickerProps> = ({
  date,
  setDate,
}) => {


  return (
    <div className="flex flex-col gap-y-2">
      <Label>
        Event Date
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={"w-full pl-3 text-base font-normal text-slate-900 flex justify-start"}
          >
            <CalendarIcon className="h-4 w-4 opacity-50" />
            {date && format(date, "dd/MM/yyyy")}           
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    </div>
  );
};
