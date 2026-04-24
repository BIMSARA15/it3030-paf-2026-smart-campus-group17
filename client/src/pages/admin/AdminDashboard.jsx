import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CalendarPlus,
  Package,
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function AdminDashboard() {
  const { bookings, resources, utilities } = useBooking();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED').length;
  const activeBookings = useMemo(
    () => bookings.filter((booking) => !['REJECTED', 'CANCELLED'].includes(booking.status)),
    [bookings]
  );

  const dashboardCards = useMemo(() => ([
    {
      title: 'Total Resources',
      value: resources.length,
      hint: 'Lecture rooms, labs, and meeting spaces',
      icon: Building2,
      iconWrap: 'bg-white/80 text-[#1E3A8A]',
      accent: 'from-[#1E3A8A] to-[#2563EB]',
      border: 'border-blue-200/70',
      cardBg: 'bg-gradient-to-br from-blue-50 via-white to-sky-50',
      hintColor: 'text-slate-600',
    },
    {
      title: 'Total Utilities',
      value: utilities.length,
      hint: 'Equipment inventory available in the system',
      icon: Package,
      iconWrap: 'bg-white/80 text-cyan-700',
      accent: 'from-cyan-600 to-sky-500',
      border: 'border-cyan-200/70',
      cardBg: 'bg-gradient-to-br from-cyan-50 via-white to-sky-50',
      hintColor: 'text-slate-600',
    },
    {
      title: 'Pending Bookings',
      value: pendingCount,
      hint: 'Requests waiting for your review',
      icon: CalendarClock,
      iconWrap: 'bg-white/80 text-amber-700',
      accent: 'from-amber-500 to-orange-500',
      border: 'border-amber-200/80',
      cardBg: 'bg-gradient-to-br from-amber-50 via-white to-orange-50',
      hintColor: 'text-slate-600',
    },
  ]), [pendingCount, resources.length, utilities.length]);

  const resourceBookingInsights = useMemo(() => {
    const counts = resources.map((resource) => ({
      id: resource.id,
      name: resource.name,
      count: activeBookings.filter((booking) => booking.resourceId === resource.id).length,
    }));

    if (counts.length === 0) {
      return {
        highest: { name: 'No resources yet', count: 0 },
        lowest: { name: 'No resources yet', count: 0 },
        maxCount: 0,
      };
    }

    const sorted = [...counts].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const ascending = [...counts].sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));

    return {
      highest: sorted[0],
      lowest: ascending[0],
      maxCount: sorted[0]?.count || 0,
    };
  }, [activeBookings, resources]);

  const utilityBookingInsights = useMemo(() => {
    const counts = utilities.map((utility) => ({
      id: utility.id,
      name: utility.utilityName,
      count: activeBookings.filter((booking) =>
        Array.isArray(booking.requestedUtilityIds) && booking.requestedUtilityIds.includes(utility.id)
      ).length,
    }));

    if (counts.length === 0) {
      return {
        highest: { name: 'No equipment yet', count: 0 },
        lowest: { name: 'No equipment yet', count: 0 },
        maxCount: 0,
      };
    }

    const sorted = [...counts].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const ascending = [...counts].sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));

    return {
      highest: sorted[0],
      lowest: ascending[0],
      maxCount: sorted[0]?.count || 0,
    };
  }, [activeBookings, utilities]);

  const getBarWidth = (count, maxCount) => {
    if (maxCount <= 0) return '8%';
    return `${Math.max((count / maxCount) * 100, 8)}%`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />

        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-gray-900 text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {pendingCount} booking{pendingCount !== 1 ? 's' : ''} awaiting your review
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/bookings')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white hover:from-[#172554] hover:to-[#1D4ED8] shadow-[0_4px_12px_rgba(37,99,235,0.3)] border-t border-white/20 rounded-xl transition-all text-sm font-medium"
              >
                <CalendarPlus className="w-4 h-4" />
                All Bookings
              </button>
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className={`relative overflow-hidden rounded-[28px] border ${card.border} ${card.cardBg} p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]`}
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} />
                  <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${card.accent} opacity-10 blur-2xl`} />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.title}</p>
                      <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{card.value}</p>
                      <p className={`mt-3 text-sm leading-6 ${card.hintColor}`}>{card.hint}</p>
                    </div>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 ${card.iconWrap}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="rounded-[30px] border border-blue-100 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Booking Trends</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">Resource and equipment demand</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                A quick view of what gets booked the most and what gets used the least.
              </p>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                  <p className="text-sm font-semibold text-slate-700">Resources</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-600">Highest booked</p>
                        <span className="text-xs font-semibold text-[#1E3A8A]">{resourceBookingInsights.highest.count} bookings</span>
                      </div>
                      <p className="text-sm text-slate-900">{resourceBookingInsights.highest.name}</p>
                      <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB]"
                          style={{ width: getBarWidth(resourceBookingInsights.highest.count, resourceBookingInsights.maxCount) }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-600">Lowest booked</p>
                        <span className="text-xs font-semibold text-slate-500">{resourceBookingInsights.lowest.count} bookings</span>
                      </div>
                      <p className="text-sm text-slate-900">{resourceBookingInsights.lowest.name}</p>
                      <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                        <div
                          className="h-2.5 rounded-full bg-slate-400"
                          style={{ width: getBarWidth(resourceBookingInsights.lowest.count, resourceBookingInsights.maxCount) }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-4">
                  <p className="text-sm font-semibold text-slate-700">Equipment</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-600">Highest booked</p>
                        <span className="text-xs font-semibold text-cyan-700">{utilityBookingInsights.highest.count} bookings</span>
                      </div>
                      <p className="text-sm text-slate-900">{utilityBookingInsights.highest.name}</p>
                      <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-sky-500"
                          style={{ width: getBarWidth(utilityBookingInsights.highest.count, utilityBookingInsights.maxCount) }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-600">Least booked</p>
                        <span className="text-xs font-semibold text-slate-500">{utilityBookingInsights.lowest.count} bookings</span>
                      </div>
                      <p className="text-sm text-slate-900">{utilityBookingInsights.lowest.name}</p>
                      <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                        <div
                          className="h-2.5 rounded-full bg-slate-400"
                          style={{ width: getBarWidth(utilityBookingInsights.lowest.count, utilityBookingInsights.maxCount) }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/50 to-slate-100 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Snapshot</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">Today&apos;s overview</h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Approved Bookings</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{approvedCount}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
                  <p className="text-sm font-medium text-slate-600">Quick actions</p>
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/bookings')}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left text-sm text-slate-600 transition-all hover:border-blue-100 hover:bg-blue-50/50"
                    >
                      Review booking approvals
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/resources')}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left text-sm text-slate-600 transition-all hover:border-blue-100 hover:bg-blue-50/50"
                    >
                      Update resource catalog
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/utilities')}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left text-sm text-slate-600 transition-all hover:border-blue-100 hover:bg-blue-50/50"
                    >
                      Check equipment inventory
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resources</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep learning spaces accurate so students and lecturers see the right availability.
              </p>
            </div>
            <div className="rounded-[24px] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Utilities</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Equipment counts update here so the booking flow can surface what is actually available.
              </p>
            </div>
            <div className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bookings</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pending requests stay visible so approvals do not get stuck waiting in the queue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
