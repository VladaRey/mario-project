import { type FC, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { enGB, pl } from "date-fns/locale";
import { useI18n } from "~/i18n/i18n-provider";

interface EventDatePickerProps {
  date: Date;
  setDate: (date: Date | undefined) => void;
}

export const EventDatePicker: FC<EventDatePickerProps> = ({
  date,
  setDate,
}) => {
  const { fmt, locale } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-12 w-full justify-start rounded-xl text-[15px] font-bold">
          <CalendarIcon />{date && fmt(date, "EEE d MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar mode="single" locale={locale === "pl" ? pl : enGB} selected={date} onSelect={(d) => { setDate(d); if (d) setOpen(false); }} />
      </PopoverContent>
    </Popover>
  );
};
