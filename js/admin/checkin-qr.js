import { supabase } from "../supabaseClient.js";
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

const titleEl = document.getElementById("eventTitle");
const dateEl = document.getElementById("eventDate");
const qrContainer = document.getElementById("qrContainer");
const urlInput = document.getElementById("checkinUrl");
const copyBtn = document.getElementById("copyBtn");
const openBtn = document.getElementById("openBtn");

if (!eventId) {
  titleEl.textContent = "Missing event ID";
  throw new Error("No event ID");
}

const checkinUrl =
  `${window.location.origin}/signupsigninv2/checkin.html?event_id=${eventId}`;

urlInput.value = checkinUrl;
openBtn.href = checkinUrl;

// Simple QR (external, acceptable for V2)
const qrImg = document.createElement("img");
qrImg.src =
  `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkinUrl)}`;
qrContainer.appendChild(qrImg);

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(checkinUrl);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy Link"), 1200);
});

loadEvent();

async function loadEvent() {
  const { data, error } = await supabase
    .from("events")
    .select("title,start_time")
    .eq("id", eventId)
    .single();

  if (error) {
    titleEl.textContent = "Event not found";
    return;
  }

  titleEl.textContent = data.title;
  dateEl.textContent = new Date(data.start_time).toLocaleString();
}
