import { FC } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useI18n } from "~/i18n/i18n-provider";

interface EventDatePickerProps {
  date: Date;
  setDate: (date: Date | undefined) => void;
}

export const EventDatePicker: FC<EventDatePickerProps> = ({
  date,
  setDate,
}) => {
  const { fmt } = useI18n();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-12 w-full justify-start rounded-xl text-[15px] font-bold">
          <CalendarIcon />{date && fmt(date, "EEE d MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  );
};
