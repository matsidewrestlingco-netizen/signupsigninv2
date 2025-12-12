import { supabase } from "../supabaseClient.js";
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

const titleEl = document.getElementById("eventTitle");
const dateEl = document.getElementById("eventDate");
const locationEl = document.getElementById("eventLocation");
const descriptionEl = document.getElementById("eventDescription");

const checkinLink = document.getElementById("checkinLink");
const manageSlotsLink = document.getElementById("manageSlotsLink");

if (!eventId) {
  titleEl.textContent = "Event not found";
  throw new Error("Missing event ID");
}

// Wire header links safely (elements guaranteed by static HTML)
checkinLink.href =
  `/signupsigninv2/admin/checkin.html?id=${eventId}`;

manageSlotsLink.href =
  `/signupsigninv2/admin/edit-event.html?id=${eventId}`;

loadEvent();

async function loadEvent() {
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    console.error(error);
    titleEl.textContent = "Event not found";
    return;
  }

  titleEl.textContent = event.title;
  dateEl.textContent = formatDate(event.start_time);

  locationEl.textContent = event.location || "—";
  descriptionEl.textContent = event.description || "—";
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
