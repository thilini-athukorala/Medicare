// Helpers for turning a doctor's availability (date + start/end time) into bookable slots.

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const pad = (n) => String(n).padStart(2, '0');
const toTime = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

// generateSlots('09:00', '10:30', 30) -> ['09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30']
const generateSlots = (startTime, endTime, slotMinutes = 30) => {
  const slots = [];
  const end = toMinutes(endTime);
  for (let s = toMinutes(startTime); s + slotMinutes <= end; s += slotMinutes) {
    slots.push(`${toTime(s)} - ${toTime(s + slotMinutes)}`);
  }
  return slots;
};

// Any date value -> 'YYYY-MM-DD'
const toDateKey = (d) => new Date(d).toISOString().slice(0, 10);

// All slots a doctor offers on one date (YYYY-MM-DD)
const slotsForDate = (doctor, dateKey) => {
  const set = new Set();
  (doctor.availability || [])
    .filter((a) => a.date === dateKey)
    .forEach((a) => {
      generateSlots(a.startTime, a.endTime, doctor.slotMinutes || 30).forEach((s) => set.add(s));
    });
  return [...set].sort();
};

module.exports = { generateSlots, toDateKey, slotsForDate, toMinutes };
