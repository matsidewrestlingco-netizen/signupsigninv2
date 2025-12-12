export function computeEventStatus(slots, eventStartTime) {
  if (!slots || slots.length === 0) return "ready";

  const now = new Date();
  const eventTime = new Date(eventStartTime);
  const hoursToEvent = (eventTime - now) / 36e5;

  let hasUnderstaffed = false;

  for (const slot of slots) {
    const filled = slot.signups?.length || 0;
    const required = slot.quantity_total;

    if (filled === 0 && hoursToEvent <= 48) {
      return "critical";
    }

    if (filled < required) {
      hasUnderstaffed = true;
    }
  }

  if (hasUnderstaffed) return "risk";
  return "ready";
}
