'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { useTransactions } from '@/hooks/useTransactions';
import { useBills } from '@/hooks/useBills';
import { useGoals } from '@/hooks/useGoals';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar as CalendarIcon, DollarSign, Target, Gift, Info } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency || 'USD';

  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  // Fetch data
  const { transactions, isLoading: txsLoading } = useTransactions({
    limit: 100, // Load a reasonable amount of transactions for the calendar
  });
  const { bills, isLoading: billsLoading } = useBills();
  const { goals, isLoading: goalsLoading } = useGoals();

  const isLoading = txsLoading || billsLoading || goalsLoading;

  // Compile calendar events
  const getEventsForDay = (date: Date) => {
    const dayEvents: Array<{
      id: string;
      type: 'income' | 'expense' | 'bill' | 'goal';
      title: string;
      amount: number;
      details?: string;
    }> = [];

    // 1. Transactions on this day
    transactions.forEach((tx: any) => {
      if (tx.date && isSameDay(new Date(tx.date), date)) {
        dayEvents.push({
          id: tx.id,
          type: tx.type === 'INCOME' ? 'income' : 'expense',
          title: tx.description,
          amount: Number(tx.amount),
          details: tx.category?.name || 'Transaction',
        });
      }
    });

    // 2. Bills due on this day of current month
    bills.forEach((bill: any) => {
      // If the bill dueDay match selected date's day of month
      if (Number(bill.dueDay) === date.getDate() && date.getMonth() === currentMonth.getMonth()) {
        dayEvents.push({
          id: bill.id,
          type: 'bill',
          title: `Bill Due: ${bill.name}`,
          amount: Number(bill.amount),
          details: bill.isPaid ? 'Already Paid' : 'Unpaid',
        });
      }
    });

    // 3. Goal milestones or deadline on this day
    goals.forEach((goal: any) => {
      if (goal.deadline && isSameDay(new Date(goal.deadline), date)) {
        dayEvents.push({
          id: goal.id,
          type: 'goal',
          title: `Goal Deadline: ${goal.name}`,
          amount: Number(goal.targetAmount),
          details: `Current: ${formatCurrency(goal.currentAmount, currency)}`,
        });
      }
    });

    return dayEvents;
  };

  // Day modifiers for coloring specific dates on DayPicker
  const modifiers = {
    hasIncome: (date: Date) => getEventsForDay(date).some((e) => e.type === 'income'),
    hasExpense: (date: Date) => getEventsForDay(date).some((e) => e.type === 'expense'),
    hasBill: (date: Date) => getEventsForDay(date).some((e) => e.type === 'bill'),
    hasGoal: (date: Date) => getEventsForDay(date).some((e) => e.type === 'goal'),
  };

  const modifiersStyles = {
    hasIncome: { borderBottom: '3px solid #10b981' }, // green dot accent
    hasExpense: { borderBottom: '3px solid #ef4444' }, // red dot accent
    hasBill: { borderBottom: '3px solid #f59e0b' }, // yellow dot accent
    hasGoal: { borderBottom: '3px solid #8b5cf6' }, // purple dot accent
  };

  const activeDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Financial Calendar"
        description="View bills, subscriptions, income, and goals plotted in a unified monthly schedule."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <Card className="lg:col-span-2 p-6 border-slate-800 bg-slate-900/60 backdrop-blur-md flex justify-center">
          <div className="w-full max-w-md">
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="mx-auto"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              classNames={{
                months: 'w-full',
                month: 'space-y-4 w-full',
                caption: 'flex justify-between pt-1 relative items-center px-4 mb-4',
                caption_label: 'text-base font-bold text-slate-100',
                nav: 'flex items-center space-x-1',
                nav_button: cn(
                  'h-8 w-8 bg-slate-800/80 border border-slate-700 p-0 opacity-80 hover:opacity-100 text-slate-200 rounded-xl flex items-center justify-center transition-colors'
                ),
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex justify-between w-full border-b border-slate-800 pb-2',
                head_cell: 'text-slate-500 rounded-md w-10 font-medium text-[0.85rem] text-center flex-1',
                row: 'flex w-full mt-2 justify-between',
                cell: 'h-10 w-10 text-center text-sm p-0 relative flex-1 flex items-center justify-center',
                day: cn(
                  'h-10 w-10 p-0 font-normal text-slate-350 rounded-xl hover:bg-slate-800 hover:text-slate-100 focus:outline-none transition-colors flex items-center justify-center'
                ),
                day_selected:
                  'bg-primary-500 text-white hover:bg-primary-600 focus:bg-primary-500 focus:text-white',
                day_today: 'bg-slate-800 text-slate-100 font-extrabold ring-1 ring-slate-700',
                day_outside: 'text-slate-700 opacity-20',
                day_disabled: 'text-slate-800 opacity-20 cursor-not-allowed',
                day_hidden: 'invisible',
              }}
            />
            {/* Color key guide */}
            <div className="mt-6 pt-4 border-t border-slate-850 flex flex-wrap gap-4 justify-center text-[10px] text-slate-400">
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-4 rounded-full bg-emerald-500" />
                <span>Income</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-4 rounded-full bg-red-500" />
                <span>Expense</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-4 rounded-full bg-amber-500" />
                <span>Bills</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-4 rounded-full bg-violet-500" />
                <span>Goals</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Day Details Card */}
        <Card className="p-6 border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col h-[420px]">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center mb-4">
            <CalendarIcon className="w-4 h-4 mr-2 text-primary-400" />
            <span>Schedule for {selectedDay ? format(selectedDay, 'MMMM dd, yyyy') : 'Selected Day'}</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-850">
            {isLoading ? (
              <p className="text-xs text-slate-500 text-center py-12">Checking schedule...</p>
            ) : activeDayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-2">
                <Info className="w-8 h-8 opacity-20" />
                <p className="text-xs">No transactions, bills, or savings events logged on this date.</p>
              </div>
            ) : (
              activeDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/20 flex items-center justify-between"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <p className="text-xs font-bold text-slate-200 truncate">{evt.title}</p>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          evt.type === 'income'
                            ? 'success'
                            : evt.type === 'expense'
                            ? 'danger'
                            : evt.type === 'bill'
                            ? 'warning'
                            : 'outline'
                        }
                        className="text-[9px] uppercase tracking-wider scale-90"
                      >
                        {evt.type}
                      </Badge>
                      <span className="text-[10px] text-slate-500 truncate">{evt.details}</span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-extrabold whitespace-nowrap',
                      evt.type === 'income'
                        ? 'text-emerald-400'
                        : evt.type === 'expense'
                        ? 'text-red-400'
                        : evt.type === 'bill'
                        ? 'text-amber-400'
                        : 'text-violet-400'
                    )}
                  >
                    {evt.type === 'income' ? '+' : evt.type === 'expense' ? '-' : ''}
                    {formatCurrency(evt.amount, currency)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
