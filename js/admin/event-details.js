import { supabase } from "../supabaseClient.js";
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

// Elements
const titleInput = document.getElementById("title");
const startInput = document.getElementById("start_time");
const descInput = document.getElementById("description");
const form = document.getElementById("eventForm");
const statusEl = document.getElementById("status");

const eventTitleDisplay = document.getElementById("eventTitleDisplay");
const eventDateDisplay = document.getElementById("eventDateDisplay");
const manageSlotsLink = document.getElementById("manageSlotsLink");

// Get event ID
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

if (!eventId) {
  statusEl.textContent = "Missing event ID.";
  throw new Error("No event ID provided");
}

// Set Manage Slots link
manageSlotsLink.href = `/signupsigninv2/admin/edit-event.html?id=${eventId}`;

// Load event
loadEvent();

async function loadEvent() {
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    console.error(error);
    statusEl.textContent = "Unable to load event.";
    return;
  }

  // Header
  eventTitleDisplay.textContent = event.title || "Event";
  eventDateDisplay.textContent = formatDate(event.start_time);

  // Header action links
  function wireHeaderLinks(eventId) {
  const checkinLink = document.getElementById("checkinLink");
  const manageSlotsLink = document.getElementById("manageSlotsHeaderLink");

  if (checkinLink) {
    checkinLink.href = `/signupsigninv2/admin/checkin.html?id=${eventId}`;
  } else {
    console.warn("checkinLink not found in DOM");
  }

  if (manageSlotsLink) {
    manageSlotsLink.href = `/signupsigninv2/admin/edit-event.html?id=${eventId}`;
  } else {
    console.warn("manageSlotsHeaderLink not found in DOM");
  }
}

  // Form values
  titleInput.value = event.title || "";
  descInput.value = event.description || "";

  if (event.start_time) {
    startInput.value = event.start_time.slice(0, 16);
  }
}

// Save handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Saving…";

  const payload = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    start_time: new Date(startInput.value).toISOString()
  };

  const { error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId);

  if (error) {
    console.error("SUPABASE ERROR:", error);
    console.error("PAYLOAD:", payload);
    statusEl.textContent = "Error saving event.";
    return;
  }

  statusEl.textContent = "Event updated successfully.";
});

wireHeaderLinks(event.id);

// Helpers
function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
