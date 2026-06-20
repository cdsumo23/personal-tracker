import * as React from 'react';
import { Command } from 'cmdk';
import { Search, Loader2, CreditCard, DollarSign, Target, Calendar, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';

export function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Trigger search on Ctrl+K / Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch search results
  const { data: results, isLoading } = useQuery({
    queryKey: ['global-search', search],
    queryFn: async () => {
      if (!search.trim()) return null;
      const res = await searchApi.globalSearch(search, 5);
      return res.data.data;
    },
    enabled: search.trim().length > 1,
  });

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 transition-all text-xs"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none select-none rounded bg-slate-900 border border-slate-700 px-1.5 py-0.5 text-[10px] font-mono leading-none text-slate-500">
          ⌘K
        </kbd>
      </button>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <Command label="Global Search Command Menu" className="flex flex-col h-full max-h-[350px]">
                <div className="flex items-center border-b border-slate-850 px-4 py-3">
                  <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search accounts, transactions, bills, goals..."
                    className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
                  />
                  {isLoading && <Loader2 className="w-4 h-4 text-primary-400 animate-spin shrink-0" />}
                  {!isLoading && search && (
                    <button
                      onClick={() => setSearch('')}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <Command.List className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
                  <Command.Empty className="py-6 text-center text-sm text-slate-500">
                    {search.trim().length <= 1
                      ? 'Type at least 2 characters to search...'
                      : 'No results found.'}
                  </Command.Empty>

                  {results && (
                    <>
                      {/* Accounts */}
                      {results.accounts && results.accounts.length > 0 && (
                        <Command.Group heading="Accounts" className="text-slate-400 text-xs px-2 py-1.5 font-semibold">
                          {results.accounts.map((acc: any) => (
                            <Command.Item
                              key={acc.id}
                              onSelect={() => navigateTo('/accounts')}
                              className="flex items-center justify-between p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 cursor-pointer text-sm font-normal"
                            >
                              <div className="flex items-center space-x-2">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                <span>{acc.name}</span>
                              </div>
                              <span className="text-xs font-semibold text-slate-400">
                                {formatCurrency(acc.balance, acc.currency || user?.currency || 'USD')}
                              </span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}

                      {/* Transactions */}
                      {results.transactions && results.transactions.length > 0 && (
                        <Command.Group heading="Transactions" className="text-slate-400 text-xs px-2 py-1.5 font-semibold mt-2">
                          {results.transactions.map((tx: any) => (
                            <Command.Item
                              key={tx.id}
                              onSelect={() => navigateTo('/transactions')}
                              className="flex items-center justify-between p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 cursor-pointer text-sm font-normal"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate">{tx.description}</span>
                              </div>
                              <span
                                className={cn(
                                  'text-xs font-semibold shrink-0',
                                  tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
                                )}
                              >
                                {tx.type === 'INCOME' ? '+' : '-'}
                                {formatCurrency(tx.amount, user?.currency || 'USD')}
                              </span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}

                      {/* Goals */}
                      {results.goals && results.goals.length > 0 && (
                        <Command.Group heading="Savings Goals" className="text-slate-400 text-xs px-2 py-1.5 font-semibold mt-2">
                          {results.goals.map((g: any) => (
                            <Command.Item
                              key={g.id}
                              onSelect={() => navigateTo('/goals')}
                              className="flex items-center justify-between p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 cursor-pointer text-sm font-normal"
                            >
                              <div className="flex items-center space-x-2">
                                <Target className="w-4 h-4 text-slate-400" />
                                <span>{g.name}</span>
                              </div>
                              <span className="text-xs text-slate-400">
                                {Math.round((g.currentAmount / g.targetAmount) * 100)}%
                              </span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}

                      {/* Bills */}
                      {results.bills && results.bills.length > 0 && (
                        <Command.Group heading="Bills" className="text-slate-400 text-xs px-2 py-1.5 font-semibold mt-2">
                          {results.bills.map((b: any) => (
                            <Command.Item
                              key={b.id}
                              onSelect={() => navigateTo('/bills')}
                              className="flex items-center justify-between p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 cursor-pointer text-sm font-normal"
                            >
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>{b.name}</span>
                              </div>
                              <span className="text-xs font-semibold text-slate-400">
                                {formatCurrency(b.amount, user?.currency || 'USD')}
                              </span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}
                    </>
                  )}

                  {/* Navigation Quick Links */}
                  <Command.Group heading="Quick Links" className="text-slate-400 text-xs px-2 py-1.5 font-semibold mt-2">
                    <Command.Item
                      onSelect={() => navigateTo('/dashboard')}
                      className="flex items-center space-x-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 cursor-pointer text-sm font-normal"
                    >
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span>Dashboard</span>
                    </Command.Item>
                    <Command.Item
                      onSelect={() => navigateTo('/accounts')}
                      className="flex items-center space-x-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 cursor-pointer text-sm font-normal"
                    >
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>Accounts</span>
                    </Command.Item>
                    <Command.Item
                      onSelect={() => navigateTo('/transactions')}
                      className="flex items-center space-x-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 cursor-pointer text-sm font-normal"
                    >
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span>Transactions</span>
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </Command>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
