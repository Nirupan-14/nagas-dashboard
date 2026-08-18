import { getMockData, ROOM_CAPACITY } from '@/lib/mock/dashboard';

export interface DashboardBooking {
  id: string;
  bookingRef: string;
  guest: { name: string; email: string; phone: string };
  room: { type: string; label: string; rate: number };
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  amount: number;
  status: string;
  source: string;
  createdAt: string;
  notes?: string;
}

export interface DashboardPayment {
  id: string;
  paymentRef: string;
  bookingRef: string;
  guest: string;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
  paidAt: string;
}

export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  guest?: string;
  bookingRef?: string;
  amount?: number;
  time: string;
}

function startOfDay(offsetDays = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function timeOf(iso: string): number {
  return new Date(iso).getTime();
}

export async function getDashboardOverview() {
  const { bookings, payments, activities } = getMockData();

  const now = new Date();
  const todayStart = startOfDay(0).getTime();
  const todayEnd = todayStart + 86400000;
  const weekStart = startOfDay(-6).getTime();
  const prevWeekStart = startOfDay(-13).getTime();

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const paidThisWeek = paidPayments.filter(
    (p) => timeOf(p.paidAt) >= weekStart && timeOf(p.paidAt) < todayEnd
  );
  const paidPrevWeek = paidPayments.filter(
    (p) => timeOf(p.paidAt) >= prevWeekStart && timeOf(p.paidAt) < weekStart
  );

  const revenueThisWeek = paidThisWeek.reduce((sum, p) => sum + p.amount, 0);
  const revenuePrevWeek = paidPrevWeek.reduce((sum, p) => sum + p.amount, 0);
  const revenueGrowth =
    revenuePrevWeek > 0
      ? ((revenueThisWeek - revenuePrevWeek) / revenuePrevWeek) * 100
      : 0;

  const revenueToday = paidPayments
    .filter((p) => timeOf(p.paidAt) >= todayStart && timeOf(p.paidAt) < todayEnd)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalBookings = bookings.length;

  const activeStatuses = ['confirmed', 'checked-in'];
  const activeBookings = bookings.filter((b) =>
    activeStatuses.includes(b.status)
  ).length;

  const todayCheckins = bookings.filter(
    (b) => timeOf(b.checkIn) >= todayStart && timeOf(b.checkIn) < todayEnd && b.status !== 'cancelled'
  ).length;

  const todayCheckouts = bookings.filter(
    (b) => timeOf(b.checkOut) >= todayStart && timeOf(b.checkOut) < todayEnd && b.status !== 'cancelled'
  ).length;

  const inHouseNow = bookings.filter(
    (b) =>
      b.status !== 'cancelled' &&
      timeOf(b.checkIn) <= now.getTime() &&
      timeOf(b.checkOut) > now.getTime()
  ).length;

  const occupancyRate = Math.min(100, Math.round((inHouseNow / ROOM_CAPACITY) * 100));

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const revenueByDay: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = startOfDay(-i).getTime();
    const dayEnd = dayStart + 86400000;
    const value = paidPayments
      .filter((p) => timeOf(p.paidAt) >= dayStart && timeOf(p.paidAt) < dayEnd)
      .reduce((sum, p) => sum + p.amount, 0);
    revenueByDay.push({ label: formatDayLabel(new Date(dayStart)), value });
  }

  const statusCounts: Record<string, number> = {};
  for (const booking of bookings) {
    statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
  }

  const recentBookings = [...bookings]
    .sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt))
    .slice(0, 8);

  const todayActivities = activities
    .filter((a) => timeOf(a.time) >= todayStart && timeOf(a.time) < todayEnd)
    .sort((a, b) => timeOf(a.time) - timeOf(b.time));

  const avgBookingValue =
    paidPayments.length > 0 ? Math.round(totalRevenue / paidPayments.length) : 0;

  return {
    stats: {
      totalRevenue,
      revenueToday,
      revenueThisWeek,
      revenueGrowth,
      totalBookings,
      activeBookings,
      todayCheckins,
      todayCheckouts,
      occupancyRate,
      inHouseNow,
      avgBookingValue,
      pendingAmount,
      pendingCount: pendingPayments.length,
    },
    revenueByDay,
    statusCounts,
    recentBookings,
    todayActivities,
  };
}

export async function getBookings(): Promise<DashboardBooking[]> {
  return [...getMockData().bookings].sort(
    (a, b) => timeOf(b.createdAt) - timeOf(a.createdAt)
  );
}

export async function getPayments(): Promise<DashboardPayment[]> {
  return [...getMockData().payments].sort(
    (a, b) => timeOf(b.paidAt) - timeOf(a.paidAt)
  );
}

export async function getActivities(): Promise<DashboardActivity[]> {
  return [...getMockData().activities].sort(
    (a, b) => timeOf(b.time) - timeOf(a.time)
  );
}
