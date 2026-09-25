import { getMockData, ROOM_CAPACITY } from '@/lib/mock/dashboard';
import { getBookingsCollection } from '@/lib/database/mongodb';

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

export interface DashboardVehicleBooking {
  id: string;
  bookingRef: string;
  vehicle: string;
  pickupDate: string;
  pickupTime: string;
  endTime: string;
  destination: string;
  guest: { name: string; email: string; phone: string };
  passengers: number;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  source: string;
  createdAt: string;
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

interface MongoBookingDoc {
  _id?: { toString(): string };
  kind?: string;
  bookingRef?: string;
  roomType?: string;
  vehicleType?: string;
  date?: string;
  pickupDate?: string;
  startTime?: string;
  pickupTime?: string;
  destination?: string;
  guest?: { name?: string; email?: string; phone?: string };
  guests?: number;
  passengers?: number;
  amount?: number;
  status?: string;
  source?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt?: string | Date;
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
  try {
    const collection = await getBookingsCollection();
    const docs: MongoBookingDoc[] = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    if (docs.length > 0) {
      return docs.map((b: MongoBookingDoc): DashboardBooking => {
        const isVehicle = b.kind === 'vehicle';
        const startTime = isVehicle ? (b.pickupTime || '00:00') : (b.startTime || '00:00');
        const startH = Number(startTime.split(':')[0]) || 0;
        const startM = Number(startTime.split(':')[1]) || 0;
        const endTotal = startH * 60 + startM + 60;
        const endH = ((endTotal % 1440) + 1440) % 1440;
        const pad = (n: number) => String(n).padStart(2, '0');
        const endTime = `${pad(Math.floor(endH / 60))}:${pad(endH % 60)}`;
        const dateField = isVehicle ? (b.pickupDate || '') : (b.date || '');
        const label = isVehicle ? (b.vehicleType || b.roomType || 'Vehicle') : (b.roomType || 'Room');
        return {
          id: String(b._id),
          bookingRef: b.bookingRef || 'NAG-BOOK',
          guest: {
            name: b.guest?.name || '—',
            email: b.guest?.email || '',
            phone: b.guest?.phone || '',
          },
          room: {
            type: isVehicle ? 'Vehicle' : (b.roomType || ''),
            label,
            rate: Number(b.amount) || 0,
          },
          checkIn: `${dateField}T${startTime}`,
          checkOut: `${dateField}T${endTime}`,
          guests: Number(isVehicle ? b.passengers : b.guests) || 1,
          nights: 1,
          amount: Number(b.amount) || 0,
          status: b.status || 'confirmed',
          source: b.source || 'website',
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
        };
      });
    }
  } catch (error) {
    console.error('[dashboard] real bookings unavailable, falling back to mock', error);
  }

  return [...getMockData().bookings].sort(
    (a, b) => timeOf(b.createdAt) - timeOf(a.createdAt)
  );
}

export async function getVehicleBookings(): Promise<DashboardVehicleBooking[]> {
  try {
    const collection = await getBookingsCollection();
    const docs: MongoBookingDoc[] = await collection
      .find({ kind: 'vehicle' })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    if (docs.length > 0) {
      return docs.map((b: MongoBookingDoc): DashboardVehicleBooking => {
        const [h, m] = String(b.pickupTime || '00:00').split(':').map(Number);
        const endTotal = (((h * 60 + (m || 0) + 60) % 1440) + 1440) % 1440;
        return {
          id: String(b._id),
          bookingRef: b.bookingRef || 'NAG-BOOK',
          vehicle: b.vehicleType || 'Vehicle',
          pickupDate: b.pickupDate || '',
          pickupTime: b.pickupTime || '',
          endTime: `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`,
          destination: b.destination || '',
          guest: {
            name: b.guest?.name || '—',
            email: b.guest?.email || '',
            phone: b.guest?.phone || '',
          },
          passengers: Number(b.passengers) || 1,
          amount: Number(b.amount) || 0,
          paymentStatus: b.paymentStatus || 'pending',
          paymentMethod: b.paymentMethod || 'pay-at-pickup',
          transactionId: b.transactionId || '',
          status: b.status || 'confirmed',
          source: b.source || 'website',
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
        };
      });
    }
  } catch (error) {
    console.error('[dashboard] vehicle bookings unavailable', error);
  }

  return [];
}

export async function getVehicleAvailabilityForAdmin(): Promise<Record<string, string[]>> {
  try {
    const collection = await getBookingsCollection();
    const docs: Array<{ vehicleType?: string; pickupDate?: string }> =
      await collection
        .find({ kind: 'vehicle', status: { $ne: 'cancelled' } })
        .project({ vehicleType: 1, pickupDate: 1 })
        .toArray();

    const mapped: Record<string, string[]> = {};
    for (const b of docs) {
      if (!b.vehicleType || !b.pickupDate) continue;
      (mapped[b.vehicleType] ||= []).push(b.pickupDate);
    }
    return mapped;
  } catch (error) {
    console.error('[dashboard] vehicle availability unavailable', error);
    return {};
  }
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
