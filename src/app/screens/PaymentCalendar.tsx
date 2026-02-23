import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays, ArrowLeft, X, ExternalLink, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DueEvent {
    id: string;
    loanId: string;
    label: string;
    borrowerName: string;
    amount: number;
    currency: string;
    type: 'loan' | 'installment';
    status: string;
}

type EventMap = Record<string, DueEvent[]>; // key = "YYYY-MM-DD"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(dateStr: string): string {
    return dateStr.slice(0, 10); // "YYYY-MM-DD"
}

function currencySymbol(code: string): string {
    const map: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦', GHS: '₵', KES: 'KSh' };
    return map[code] || '$';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PaymentCalendar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth()); // 0-indexed
    const [eventMap, setEventMap] = useState<EventMap>({});
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        fetchEvents();
    }, [user]);

    async function fetchEvents() {
        setLoading(true);
        try {
            // Fetch loans with due_date
            const { data: loans, error: loanErr } = await supabase
                .from('loans')
                .select('id, borrower_name, amount, currency, due_date, status')
                .eq('user_id', user!.id)
                .not('due_date', 'is', null);

            if (loanErr) throw loanErr;

            // Fetch installments
            const { data: installments, error: instErr } = await supabase
                .from('installments')
                .select('id, loan_id, amount, due_date, status, loan:loan_id(borrower_name, currency)')
                .in('loan_id', (loans || []).map((l: any) => l.id))
                .neq('status', 'PAID');

            if (instErr) throw instErr;

            const map: EventMap = {};

            const addEvent = (key: string, event: DueEvent) => {
                if (!map[key]) map[key] = [];
                map[key].push(event);
            };

            (loans || []).forEach((loan: any) => {
                if (loan.due_date && loan.status !== 'PAID') {
                    const key = toDateKey(loan.due_date);
                    addEvent(key, {
                        id: loan.id,
                        loanId: loan.id,
                        label: 'Loan Due',
                        borrowerName: loan.borrower_name,
                        amount: loan.amount,
                        currency: loan.currency || 'USD',
                        type: 'loan',
                        status: loan.status,
                    });
                }
            });

            (installments || []).forEach((inst: any) => {
                if (inst.due_date) {
                    const key = toDateKey(inst.due_date);
                    addEvent(key, {
                        id: inst.id,
                        loanId: inst.loan_id,
                        label: 'Installment',
                        borrowerName: inst.loan?.borrower_name || 'Borrower',
                        amount: inst.amount,
                        currency: inst.loan?.currency || 'USD',
                        type: 'installment',
                        status: inst.status,
                    });
                }
            });

            setEventMap(map);
        } catch (err) {
            toast.error('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    }

    // ─── Calendar Grid Logic ───────────────────────────────────────────────────

    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
        setSelectedDay(null);
    };

    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
        setSelectedDay(null);
    };

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // Pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);

    const getDayKey = (day: number) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const totalEventsThisMonth = Object.entries(eventMap).filter(([k]) =>
        k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
    ).reduce((sum, [, evts]) => sum + evts.length, 0);

    const selectedEvents = selectedDay ? (eventMap[selectedDay] || []) : [];

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-2xl mx-auto flex items-center gap-4 px-4 py-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full shrink-0">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-indigo-600" />
                            Payment Calendar
                        </h1>
                        {!loading && (
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                {totalEventsThisMonth} event{totalEventsThisMonth !== 1 ? 's' : ''} this month
                            </p>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Month Navigator */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full hover:bg-slate-50">
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <motion.h2
                            key={`${year}-${month}`}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-lg font-bold text-slate-900"
                        >
                            {MONTH_NAMES[month]} {year}
                        </motion.h2>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full hover:bg-slate-50">
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </Button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-slate-50">
                        {DAY_LABELS.map(d => (
                            <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <motion.div
                            key={`${year}-${month}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-7 p-3 gap-1"
                        >
                            {cells.map((day, idx) => {
                                if (!day) return <div key={idx} className="h-12 rounded-xl" />;

                                const key = getDayKey(day);
                                const events = eventMap[key] || [];
                                const isToday = key === todayKey;
                                const isSelected = key === selectedDay;
                                const hasEvents = events.length > 0;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedDay(isSelected ? null : key)}
                                        className={`
                                            relative h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 
                                            ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' :
                                                isToday ? 'bg-indigo-50 text-indigo-600 font-bold' :
                                                    hasEvents ? 'bg-slate-50 hover:bg-slate-100 text-slate-900' :
                                                        'hover:bg-slate-50 text-slate-600'}
                                        `}
                                    >
                                        <span className="text-sm font-bold leading-none">{day}</span>
                                        {hasEvents && !isSelected && (
                                            <div className="flex gap-0.5 mt-1">
                                                {Array.from({ length: Math.min(events.length, 3) }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1 h-1 rounded-full ${events[i]?.type === 'loan' ? 'bg-rose-400' : 'bg-indigo-400'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {hasEvents && isSelected && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/70 mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <span className="text-xs text-slate-500 font-medium">Loan Due</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                        <span className="text-xs text-slate-500 font-medium">Installment</span>
                    </div>
                </div>

                {/* Selected Day Panel */}
                <AnimatePresence>
                    {selectedDay && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
                        >
                            {/* Panel Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">
                                        {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
                                            weekday: 'long', month: 'long', day: 'numeric'
                                        })}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                        {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost" size="icon"
                                    onClick={() => setSelectedDay(null)}
                                    className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Events List */}
                            {selectedEvents.length === 0 ? (
                                <div className="px-6 py-8 text-center">
                                    <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400 font-medium">No events on this day</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {selectedEvents.map((evt) => {
                                        const sym = currencySymbol(evt.currency);
                                        return (
                                            <div
                                                key={evt.id}
                                                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${evt.type === 'loan'
                                                            ? 'bg-rose-50 text-rose-600'
                                                            : 'bg-indigo-50 text-indigo-600'
                                                        }`}>
                                                        <CalendarDays className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{evt.borrowerName}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                            {evt.label}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900 text-sm tabular-nums">
                                                            {sym}{Number(evt.amount).toLocaleString()}
                                                        </p>
                                                        <span className={`text-[9px] font-black uppercase rounded-full px-2 py-0.5 ${evt.status === 'active' || evt.status === 'PENDING'
                                                                ? 'bg-amber-50 text-amber-700'
                                                                : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {evt.status}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => navigate(`/loan/${evt.loanId}`)}
                                                        className="rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 w-8 h-8"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upcoming Events (next 30 days) */}
                {!loading && (() => {
                    const upcoming = Object.entries(eventMap)
                        .filter(([k]) => {
                            const d = new Date(k + 'T12:00:00');
                            const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                            return diff >= 0 && diff <= 30;
                        })
                        .sort(([a], [b]) => a.localeCompare(b))
                        .slice(0, 5);

                    if (upcoming.length === 0) return null;

                    return (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Upcoming (Next 30 Days)
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {upcoming.map(([dateKey, events]) => {
                                    const date = new Date(dateKey + 'T12:00:00');
                                    const daysLeft = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <button
                                            key={dateKey}
                                            onClick={() => {
                                                setYear(date.getFullYear());
                                                setMonth(date.getMonth());
                                                setSelectedDay(dateKey);
                                            }}
                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-center w-12 shrink-0">
                                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                        {date.toLocaleDateString('en-US', { month: 'short' })}
                                                    </div>
                                                    <div className="text-2xl font-black text-slate-900 leading-none">
                                                        {date.getDate()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">
                                                        {events.length} event{events.length > 1 ? 's' : ''} due
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                        {events.map(e => e.borrowerName).slice(0, 2).join(', ')}
                                                        {events.length > 2 ? ` +${events.length - 2} more` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${daysLeft <= 3
                                                    ? 'bg-rose-50 text-rose-600'
                                                    : daysLeft <= 7
                                                        ? 'bg-amber-50 text-amber-600'
                                                        : 'bg-slate-50 text-slate-500'
                                                }`}>
                                                {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            </main>
        </div>
    );
}
