import { supabase } from "../supabaseClient.js";
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

const form = document.getElementById("eventForm");
const statusMsg = document.getElementById("statusMsg");

const titleInput = document.getElementById("title");
const startInput = document.getElementById("start_time");
const locationInput = document.getElementById("location");
const descriptionInput = document.getElementById("description");

const manageSlotsLink = document.getElementById("manageSlotsLink");
const checkinLink = document.getElementById("checkinLink");

if (!eventId) {
  alert("Missing event ID");
  throw new Error("Missing event ID");
}

// Wire action links (static DOM — safe)
manageSlotsLink.href =
  `/signupsigninv2/admin/edit-event.html?id=${eventId}`;

checkinLink.href =
  `/signupsigninv2/admin/checkin.html?id=${eventId}`;

loadEvent();

async function loadEvent() {
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    console.error(error);
    statusMsg.textContent = "Failed to load event.";
    return;
  }

  titleInput.value = event.title || "";
  startInput.value = event.start_time
    ? event.start_time.slice(0, 16)
    : "";
  locationInput.value = event.location || "";
  descriptionInput.value = event.description || "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusMsg.textContent = "Saving…";

  const payload = {
    title: titleInput.value.trim(),
    start_time: startInput.value,
    location: locationInput.value.trim(),
    description: descriptionInput.value.trim()
  };

  const { error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId);

  if (error) {
    console.error("SAVE ERROR:", error);
    statusMsg.textContent = "Error saving changes.";
    return;
  }

  statusMsg.textContent = "Changes saved successfully.";
});
