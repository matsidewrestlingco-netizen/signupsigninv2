import { supabase } from "../supabaseClient.js";
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");

const form = document.getElementById("eventForm");
const statusEl = document.getElementById("status");

const titleInput = document.getElementById("title");
const startInput = document.getElementById("start_time");
const locationInput = document.getElementById("location");
const descInput = document.getElementById("description");

const manageSlotsLink = document.getElementById("manageSlotsLink");
const checkinLink = document.getElementById("checkinLink");

if (!eventId) {
  statusEl.textContent = "Missing event ID.";
  throw new Error("No event ID provided");
}

// Wire buttons
manageSlotsLink.href = `/signupsigninv2/admin/edit-event.html?id=${eventId}`;
checkinLink.href = `/signupsigninv2/admin/checkin.html?id=${eventId}`;

document.addEventListener("DOMContentLoaded", () => {
  loadEvent();
});

async function loadEvent() {
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    console.error(error);
    statusEl.textContent = "Unable to load event.";
    eventTitle.textContent = "Event not found";
    return;
  }

  // Header
  eventTitle.textContent = event.title || "Event";
  eventDate.textContent = formatDate(event.start_time);

  // Form values
  titleInput.value = event.title || "";
  descInput.value = event.description || "";
  locationInput.value = event.location || "";

  if (event.start_time) {
    // Works with timestamptz ISO strings
    startInput.value = event.start_time.slice(0, 16);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Saving…";

  const payload = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    location: locationInput.value.trim(),
    start_time: new Date(startInput.value).toISOString()
  };

  const { error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId);

  if (error) {
    console.error("SUPABASE ERROR:", error);
    console.error("PAYLOAD:", payload);
    statusEl.textContent = "Error saving changes.";
    return;
  }

  statusEl.textContent = "Changes saved successfully.";
  // update header date/title immediately
  eventTitle.textContent = payload.title || "Event";
  eventDate.textContent = formatDate(payload.start_time);
});

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
