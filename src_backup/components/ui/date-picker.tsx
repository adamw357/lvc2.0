"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void; // Allow undefined for clearing
  disabled?: (date: Date) => boolean;
  className?: string;
  fromDate?: Date; // Optional minimum date
}

export function DatePickerComponent({
  selected,
  onSelect,
  disabled,
  className,
  fromDate = new Date(new Date().setDate(new Date().getDate() + 90)), // Default to 90 days from now
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          disabled={disabled}
          initialFocus
          fromDate={fromDate} // Apply minimum date
        />
      </PopoverContent>
    </Popover>
  )
} 