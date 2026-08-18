import type { DashboardActivity, DashboardBooking, DashboardPayment } from '@/lib';

export const ROOMS = [
  { type: 'lagoon-villa', label: 'Lagoon Villa Retreat', rate: 45000 },
  { type: 'ocean-pavilion', label: 'Ocean Edge Pavilion', rate: 38000 },
  { type: 'garden-suite', label: 'Garden House Escape', rate: 32000 },
  { type: 'royal-suite', label: 'Royal Residence Suite', rate: 85000 },
] as const;

export const ROOM_CAPACITY = 18; // 8 + 4 + 4 + 2

const GUESTS = [
  ['Ahalya Sivapalan', 'ahalyas@example.com', '+94 77 123 4561'],
  ['Kavin Prabhakaran', 'kavinp@example.com', '+94 76 232 8912'],
  ['Niroshan Thavaraj', 'niroshant@example.com', '+94 77 345 2104'],
  ['Dilini Ramanan', 'dilinir@example.com', '+94 75 456 3378'],
  ['Sharmila Nadarajah', 'sharmilan@example.com', '+94 77 567 4821'],
  ['Arul Kanthasamy', 'arulk@example.com', '+94 76 678 5990'],
  ['Yogini Sivagnanam', 'yoginis@example.com', '+94 77 789 6112'],
  ['Mahesh Ranjan', 'maheshr@example.com', '+94 75 890 7425'],
  ['Tharsika Velautham', 'tharsikav@example.com', '+94 77 901 8834'],
  ['Kabilan Suresh', 'kabilans@example.com', '+94 76 012 9340'],
  ['Reshmi Chandran', 'reshmic@example.com', '+94 77 123 0567'],
  ['Prasanna Ganesh', 'prasannag@example.com', '+94 75 234 1678'],
  ['Vithusha Arumainayagam', 'vithushaa@example.com', '+94 77 345 2789'],
  ['Suthan Krishnapillai', 'suthank@example.com', '+94 76 456 3890'],
  ['Anjali Ravindran', 'anjalir@example.com', '+94 77 567 4901'],
  ['Thevika Jeyapragasam', 'thevikaj@example.com', '+94 75 678 5012'],
  ['Naveen Thamil', 'naveent@example.com', '+94 77 789 6123'],
  ['Kowsalya Muralitharan', 'kowsalyam@example.com', '+94 76 890 7234'],
  ['Janani Somasundaram', 'jananis@example.com', '+94 77 901 8345'],
  ['Ragu Selvarajah', 'ragus@example.com', '+94 75 012 9456'],
  ['Priyanka Suthaharan', 'priyankas@example.com', '+94 77 123 0561'],
  ['Amirtha Veluppillai', 'amirthav@example.com', '+94 76 234 1672'],
  ['Shangeetha Kuganathan', 'shangeethak@example.com', '+94 77 345 2783'],
  ['Ruban Mylvaganam', 'rubanm@example.com', '+94 75 456 3894'],
  ['Vinoja Kanagasabai', 'vinojak@example.com', '+94 77 567 4905'],
] as const;

const SOURCES = ['website', 'phone', 'walk-in', 'ota', 'email'] as const;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysFromNow(n: number, hour = 14): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function startOfDay(offset = 0): Date {
  const d = daysFromNow(offset, 0);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

function nightsBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function pad(num: number, size = 4): string {
  return String(num).padStart(size, '0');
}

interface RawBooking extends Omit<DashboardBooking, 'id' | 'checkIn' | 'checkOut' | 'createdAt'> {
  checkIn: Date;
  checkOut: Date;
  createdAt: Date;
}

interface RawPayment extends Omit<DashboardPayment, 'id' | 'paidAt'> {
  paidAt: Date;
}

function generate() {
  const random = mulberry32(20260812);
  const bookings: RawBooking[] = [];
  let refCounter = 1;
  const doneToday = { checkin: 0, checkout: 0 };

  const push = (b: Omit<RawBooking, 'bookingRef' | 'nights' | 'amount'>) => {
    const nights = Math.max(1, nightsBetween(b.checkIn, b.checkOut));
    bookings.push({
      ...b,
      bookingRef: `BK-2026-${pad(refCounter++)}`,
      nights,
      amount: b.room.rate * nights,
    });
  };

  // Past checked-out stays (days -55 .. -2)
  for (let d = -55; d <= -2; d += 1 + Math.floor(random() * 3)) {
    const checkIn = startOfDay(d);
    const stay = 1 + Math.floor(random() * 6);
    const guest = GUESTS[Math.floor(random() * GUESTS.length)];
    const room = ROOMS[Math.floor(random() * ROOMS.length)];
    const createdAt = addHours(checkIn, -24 * (1 + Math.floor(random() * 20)));
    push({
      guest: { name: guest[0], email: guest[1], phone: guest[2] },
      room: { type: room.type, label: room.label, rate: room.rate },
      checkIn,
      checkOut: daysFromNow(d + stay),
      guests: 1 + Math.floor(random() * 4),
      status: random() < 0.12 ? 'cancelled' : 'checked-out',
      source: SOURCES[Math.floor(random() * SOURCES.length)],
      createdAt,
      notes: random() < 0.2 ? 'Late check-in requested.' : undefined,
    });
  }

  // Bookings checked-in today
  const todayCiTarget = 6;
  while (doneToday.checkin < todayCiTarget) {
    const room = ROOMS[Math.floor(random() * ROOMS.length)];
    const guest = GUESTS[Math.floor(random() * GUESTS.length)];
    push({
      guest: { name: guest[0], email: guest[1], phone: guest[2] },
      room: { type: room.type, label: room.label, rate: room.rate },
      checkIn: startOfDay(0),
      checkOut: daysFromNow(1 + Math.floor(random() * 5)),
      guests: 1 + Math.floor(random() * 4),
      status: 'checked-in',
      source: SOURCES[Math.floor(random() * SOURCES.length)],
      createdAt: addHours(startOfDay(-2), 9 + Math.floor(random() * 10)),
    });
    doneToday.checkin += 1;
  }

  // Bookings checking out today
  const todayCoTarget = 5;
  while (doneToday.checkout < todayCoTarget) {
    const room = ROOMS[Math.floor(random() * ROOMS.length)];
    const guest = GUESTS[Math.floor(random() * GUESTS.length)];
    const checkIn = startOfDay(-(1 + Math.floor(random() * 5)));
    push({
      guest: { name: guest[0], email: guest[1], phone: guest[2] },
      room: { type: room.type, label: room.label, rate: room.rate },
      checkIn,
      checkOut: startOfDay(0),
      guests: 1 + Math.floor(random() * 4),
      status: 'checked-in',
      source: SOURCES[Math.floor(random() * SOURCES.length)],
      createdAt: addHours(checkIn, -48),
    });
    doneToday.checkout += 1;
  }

  // Upcoming confirmed / pending bookings (days +1 .. +45)
  for (let d = 1; d <= 45; d += 1 + Math.floor(random() * 3)) {
    const room = ROOMS[Math.floor(random() * ROOMS.length)];
    const guest = GUESTS[Math.floor(random() * GUESTS.length)];
    const status = random() < 0.2 ? 'pending' : 'confirmed';
    push({
      guest: { name: guest[0], email: guest[1], phone: guest[2] },
      room: { type: room.type, label: room.label, rate: room.rate },
      checkIn: startOfDay(d),
      checkOut: startOfDay(d + 1 + Math.floor(random() * 5)),
      guests: 1 + Math.floor(random() * 4),
      status,
      source: SOURCES[Math.floor(random() * SOURCES.length)],
      createdAt: addHours(startOfDay(-30), 8 + Math.floor(random() * 12)),
    });
  }

  // Payments
  const payments: RawPayment[] = [];
  let payCounter = 1;
  const nonCancelled = bookings.filter(
    (b) => b.status !== 'cancelled' && b.checkOut.getTime() <= Date.now()
  );

  for (const booking of nonCancelled) {
    const paidOn = addHours(booking.checkIn, -(20 + Math.floor(random() * 160)));
    const isRefunded = booking.status === 'cancelled' && random() < 0.4;
    const methodOptions = ['card', 'bank-transfer', 'cash', 'digital-wallet'];
    payments.push({
      paymentRef: `PAY-${pad(payCounter++)}`,
      bookingRef: booking.bookingRef,
      guest: booking.guest.name,
      amount: booking.amount,
      method: methodOptions[Math.floor(random() * methodOptions.length)],
      status: isRefunded ? 'refunded' : 'paid',
      transactionId: `TXN${Math.floor(100000000 + random() * 899999999)}`,
      paidAt: paidOn,
    });
  }

  const pendingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );
  for (let i = 0; i < 4 && i < pendingBookings.length; i++) {
    const booking = pendingBookings[i];
    payments.push({
      paymentRef: `PAY-${pad(payCounter++)}`,
      bookingRef: booking.bookingRef,
      guest: booking.guest.name,
      amount: booking.amount,
      method: 'card',
      status: 'pending',
      transactionId: '',
      paidAt: new Date(),
    });
  }

  // Activities (today)
  interface RawActivity extends Omit<DashboardActivity, 'time'> {
    time: Date;
  }
  const activities: RawActivity[] = [];
  const today = startOfDay(0);
  let activityCounter = 1;
  const pushActivity = (a: Omit<RawActivity, 'id'>) =>
    activities.push({ id: `act-${activityCounter++}`, ...a });

  bookings
    .filter((b) => b.status === 'checked-in' || b.status === 'checked-out')
    .slice(-12)
    .forEach((booking, i) => {
      const hour = 8 + (i % 10);
      pushActivity({
        type: 'check-in',
        title: `${booking.guest.name.split(' ')[0]} checked in`,
        description: `${booking.room.label} · ${booking.nights} night${booking.nights > 1 ? 's' : ''} · ${booking.guest.name}`,
        guest: booking.guest.name,
        bookingRef: booking.bookingRef,
        time: addHours(today, hour),
      });
    });

  payments
    .filter((p) => p.status === 'paid')
    .slice(0, 6)
    .forEach((payment, i) => {
      const hour = 9 + ((i * 3) % 10);
      pushActivity({
        type: 'payment',
        title: `Payment received — ${payment.guest.split(' ')[0]}`,
        description: `${payment.paymentRef} · ${payment.method.replace('-', ' ')}`,
        guest: payment.guest,
        bookingRef: payment.bookingRef,
        amount: payment.amount,
        time: addHours(today, hour),
      });
    });

  [11, 15, 17].forEach((hour, i) => {
    pushActivity({
      type: 'spa',
      title: 'Spa & wellness appointment',
      description: `Ayurvedic treatment booked for ${['Niro', 'Sharmila', 'Kabilan'][i] || 'a guest'}`,
      time: addHours(today, hour),
    });
  });

  pushActivity({
    type: 'dining',
    title: 'Private beachfront dinner',
    description: 'Sunset dinner setup for 2 · Ocean Edge Pavilion terrace',
    time: addHours(today, 19),
  });

  pushActivity({
    type: 'event',
    title: 'Garden event walkthrough',
    description: 'Wedding event scheduled for next weekend · Garden House',
    time: addHours(today, 16),
  });

  pushActivity({
    type: 'booking',
    title: 'New booking confirmed',
    description: 'Royal Residence Suite · 4 nights',
    time: addHours(today, 10),
  });

  activities.sort((a, b) => a.time.getTime() - b.time.getTime());

  const serializeBooking = (b: RawBooking): DashboardBooking => ({
    id: b.bookingRef,
    bookingRef: b.bookingRef,
    guest: b.guest,
    room: b.room,
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
    guests: b.guests,
    nights: b.nights,
    amount: b.amount,
    status: b.status,
    source: b.source,
    createdAt: b.createdAt.toISOString(),
    notes: b.notes,
  });

  const serializePayment = (p: RawPayment): DashboardPayment => ({
    id: p.paymentRef,
    paymentRef: p.paymentRef,
    bookingRef: p.bookingRef,
    guest: p.guest,
    amount: p.amount,
    method: p.method,
    status: p.status,
    transactionId: p.transactionId,
    paidAt: p.paidAt.toISOString(),
  });

  return {
    bookings: bookings.map(serializeBooking),
    payments: payments.map(serializePayment),
    activities: activities.map((a) => ({
      ...a,
      time: a.time.toISOString(),
    })),
  };
}

let cache: ReturnType<typeof generate> | null = null;

export function getMockData() {
  if (!cache) cache = generate();
  return cache;
}

export function resetMockData() {
  cache = null;
}
