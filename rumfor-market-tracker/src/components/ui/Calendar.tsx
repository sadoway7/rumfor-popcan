"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

interface CalendarProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | { from?: Date; to?: Date } | undefined;
  onSelect?: (date: any) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  disabled,
  initialFocus = false,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    Array.isArray(selected) ? selected[0] : 
    typeof selected === "object" && selected && 'from' in selected ? (selected as any).from :
    selected instanceof Date ? selected : undefined
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onSelect?.(date);
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-9"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();
      const isDisabled = disabled?.(date);
      
      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateSelect(date)}
          className={cn(
            "h-9 w-9 rounded-lg text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:bg-accent focus:text-accent-foreground focus:outline-none",
            isSelected && "bg-primary text-primary-foreground",
            isToday && !isSelected && "bg-accent/50",
            isDisabled && "text-muted-foreground/50 cursor-not-allowed",
            !isDisabled && "cursor-pointer"
          )}
          disabled={isDisabled}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const changeMonth = (increment: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + increment, 1));
  };

  return (
    <div className={cn("w-fit p-3", className)}>
      <div className="relative flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="h-9 w-9 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-sm font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="h-9 w-9 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="h-9 p-0 text-xs font-medium text-muted-foreground/80 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };