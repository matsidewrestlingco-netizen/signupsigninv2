import { supabase } from "../supabaseClient.js";
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

const titleEl = document.getElementById("title");
const startEl = document.getElementById("start_time");
const descEl = document.getElementById("description");
const form = document.getElementById("eventForm");
const statusEl = document.getElementById("status");
const manageSlotsLink = document.getElementById("manageSlotsLink");

if (!eventId) {
  statusEl.textContent = "Missing event ID.";
  throw new Error("No event id");
}

manageSlotsLink.href = `/signupsigninv2/admin/edit-event.html?id=${eventId}`;

loadEvent();

async function loadEvent() {
  const { data: ev, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !ev) {
    statusEl.textContent = "Unable to load event.";
    return;
  }

  titleEl.value = ev.title || "";
  descEl.value = ev.description || "";

  if (ev.start_time) {
    startEl.value = ev.start_time.slice(0, 16);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Saving…";

  const payload = {
    title: titleEl.value.trim(),
    description: descEl.value.trim(),
    start_time: new Date(startEl.value).toISOString()
  };

  const { error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId);

  if (error) {
    console.error(error);
    statusEl.textContent = "Error saving event.";
    return;
  }

  statusEl.textContent = "Event updated successfully.";
});
