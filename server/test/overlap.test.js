import { describe, it, expect } from 'vitest';

/**
 * Standard interval overlap algorithm used by Hotelier Reservation Engine:
 * existing.check_in < newCheckOut && existing.check_out > newCheckIn
 */
function isOverlapping(existingCheckIn, existingCheckOut, newCheckIn, newCheckOut) {
  return existingCheckIn < newCheckOut && existingCheckOut > newCheckIn;
}

function canBookRoom(existingReservations, newCheckIn, newCheckOut) {
  const activeBookings = existingReservations.filter((r) => r.status === 'CONFIRMED');
  const hasConflict = activeBookings.some((r) =>
    isOverlapping(r.check_in, r.check_out, newCheckIn, newCheckOut)
  );
  return !hasConflict;
}

describe('Hotelier Double-Booking Prevention & Date Overlap Engine', () => {
  const existingBooking = {
    id: 'res-001',
    room_id: 'room-101',
    check_in: '2026-11-10',
    check_out: '2026-11-15',
    status: 'CONFIRMED'
  };

  it('rejects an identical date reservation request (Exact Duplicate)', () => {
    const allowed = canBookRoom([existingBooking], '2026-11-10', '2026-11-15');
    expect(allowed).toBe(false);
  });

  it('rejects an overlapping booking that starts during an existing stay (Partial End Overlap)', () => {
    const allowed = canBookRoom([existingBooking], '2026-11-12', '2026-11-18');
    expect(allowed).toBe(false);
  });

  it('rejects an overlapping booking that ends during an existing stay (Partial Start Overlap)', () => {
    const allowed = canBookRoom([existingBooking], '2026-11-05', '2026-11-12');
    expect(allowed).toBe(false);
  });

  it('rejects a reservation completely enclosed within an existing stay', () => {
    const allowed = canBookRoom([existingBooking], '2026-11-11', '2026-11-14');
    expect(allowed).toBe(false);
  });

  it('rejects a reservation that completely spans across and encloses an existing stay', () => {
    const allowed = canBookRoom([existingBooking], '2026-11-08', '2026-11-20');
    expect(allowed).toBe(false);
  });

  it('allows same-day checkout/checkin transition (Guest A checks out, Guest B checks in)', () => {
    // Existing is Nov 10 - Nov 15. New guest checks in Nov 15 - Nov 20.
    const allowedAfter = canBookRoom([existingBooking], '2026-11-15', '2026-11-20');
    expect(allowedAfter).toBe(true);

    // Prior guest checks out Nov 10, existing guest checks in Nov 10.
    const allowedBefore = canBookRoom([existingBooking], '2026-11-05', '2026-11-10');
    expect(allowedBefore).toBe(true);
  });

  it('allows non-overlapping dates completely before or after the booking window', () => {
    const allowedBefore = canBookRoom([existingBooking], '2026-11-01', '2026-11-08');
    expect(allowedBefore).toBe(true);

    const allowedAfter = canBookRoom([existingBooking], '2026-11-20', '2026-11-25');
    expect(allowedAfter).toBe(true);
  });

  it('ignores cancelled bookings and allows rebooking previously cancelled slots', () => {
    const cancelledBooking = {
      ...existingBooking,
      status: 'CANCELLED'
    };
    const allowed = canBookRoom([cancelledBooking], '2026-11-10', '2026-11-15');
    expect(allowed).toBe(true);
  });
});
