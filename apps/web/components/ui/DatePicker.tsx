import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import 'react-day-picker/dist/style.css';

export interface DatePickerProps {
  date?: Date;
  onDateChange: (date?: Date) => void;
  label?: string;
  error?: string;
  className?: string;
}

export function DatePicker({ date, onDateChange, label, error, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              'flex items-center justify-between w-full py-3 px-4 rounded-xl bg-slate-800 border text-left text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-205',
              {
                'border-slate-700': !error,
                'border-red-500/80 focus:ring-red-500/50': error,
                'text-slate-400': !date,
              },
              className
            )}
          >
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span>{date ? format(date, 'PPP') : 'Pick a date'}</span>
            </div>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className="z-50 p-3 rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(d) => {
                onDateChange(d);
                setOpen(false);
              }}
              showOutsideDays
              className="p-0 m-0 border-0"
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-between pt-1 relative items-center px-8',
                caption_label: 'text-sm font-semibold text-slate-100',
                nav: 'flex items-center space-x-1',
                nav_button: cn(
                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-100 transition-opacity'
                ),
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-slate-500 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                day: cn(
                  'h-9 w-9 p-0 font-normal text-slate-300 rounded-lg hover:bg-slate-800 hover:text-slate-100 focus:outline-none transition-colors'
                ),
                day_selected:
                  'bg-primary-500 text-white hover:bg-primary-600 focus:bg-primary-500 focus:text-white',
                day_today: 'bg-slate-800 text-slate-100 font-semibold',
                day_outside: 'text-slate-650 opacity-40',
                day_disabled: 'text-slate-700 opacity-20 cursor-not-allowed',
                day_hidden: 'invisible',
              }}
              components={{
                IconLeft: () => <ChevronLeft className="h-4 h-4" />,
                IconRight: () => <ChevronRight className="h-4 h-4" />,
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
