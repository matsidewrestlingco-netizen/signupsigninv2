import { supabase } from "../supabaseClient.js";
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

const eventTitleEl = document.getElementById("eventTitle");
const eventDateEl = document.getElementById("eventDate");
const container = document.getElementById("checkinContainer");

if (!eventId) {
  container.textContent = "Missing event ID.";
  throw new Error("No event ID");
}

loadCheckinData();

async function loadCheckinData() {
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      start_time,
      slots (
        id,
        name,
        category,
        signups (
          id,
          full_name,
          checked_in,
          checked_in_at
        )
      )
    `)
    .eq("id", eventId)
    .single();

  if (error || !event) {
    console.error(error);
    container.textContent = "Unable to load check-in data.";
    return;
  }

  eventTitleEl.textContent = event.title;
  eventDateEl.textContent = formatDate(event.start_time);

  renderSlots(event.slots || []);
}

function renderSlots(slots) {
  container.innerHTML = "";

  if (slots.length === 0) {
    container.innerHTML = "<div class='muted'>No slots found.</div>";
    return;
  }

  for (const slot of slots) {
    const group = document.createElement("div");
    group.className = "slot-group";

    group.innerHTML = `
      <div class="slot-title">${slot.name}</div>
    `;

    if (!slot.signups || slot.signups.length === 0) {
      group.innerHTML += `<div class="muted">No signups</div>`;
    } else {
      for (const signup of slot.signups) {
        const row = document.createElement("div");
        row.className = "signup-row";

        if (signup.checked_in) {
          row.innerHTML = `
            <div>${signup.full_name}</div>
            <div class="checked-in">✔ Checked In</div>
          `;
        } else {
          const btn = document.createElement("button");
          btn.className = "btn btn-primary checkin-btn";
          btn.textContent = "Check In";

          btn.addEventListener("click", () =>
            checkInVolunteer(signup.id, row)
          );

          row.appendChild(document.createElement("div")).textContent =
            signup.full_name;
          row.appendChild(btn);
        }

        group.appendChild(row);
      }
    }

    container.appendChild(group);
  }
}

async function checkInVolunteer(signupId, rowEl) {
  // Optimistic UI
  rowEl.innerHTML = `
    <div>Checking in…</div>
    <div class="checked-in">…</div>
  `;

  const { error } = await supabase
    .from("signups")
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString()
    })
    .eq("id", signupId);

  if (error) {
    console.error("CHECK-IN ERROR:", error);
    rowEl.innerHTML = `
      <div>Error</div>
      <button class="btn btn-danger">Retry</button>
    `;
    return;
  }

  rowEl.innerHTML = `
    <div>Checked In</div>
    <div class="checked-in">✔ Checked In</div>
  `;
}

function formatDate(ts) {
  return new Date(ts).toLocaleString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
