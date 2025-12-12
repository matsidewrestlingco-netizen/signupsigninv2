import { supabase } from "./supabaseClient.js";

const params = new URLSearchParams(window.location.search);
const eventId = params.get("event_id");

const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const slotsEl = document.getElementById("slots");

const namesSection = document.getElementById("namesSection");
const namesEl = document.getElementById("names");
const slotTitle = document.getElementById("slotTitle");
const searchInput = document.getElementById("search");

const successSection = document.getElementById("successSection");

let currentSignups = [];

if (!eventId) {
  eventTitle.textContent = "Missing Event";
  throw new Error("No event_id");
}

loadEvent();
loadSlots();

async function loadEvent() {
  const { data } = await supabase
    .from("events")
    .select("title,start_time")
    .eq("id", eventId)
    .single();

  if (!data) return;

  eventTitle.textContent = data.title;
  eventDate.textContent = new Date(data.start_time).toLocaleString();
}

async function loadSlots() {
  const { data: slots } = await supabase
    .from("slots")
    .select("*")
    .eq("event_id", eventId)
    .order("category")
    .order("sort_order");

  const grouped = {};
  slots.forEach(s => {
    grouped[s.category || "Other"] ??= [];
    grouped[s.category || "Other"].push(s);
  });

  for (const category in grouped) {
    const h = document.createElement("h3");
    h.textContent = category;
    slotsEl.appendChild(h);

    grouped[category].forEach(slot => {
      const btn = document.createElement("button");
      btn.className = "btn btn-secondary slot-btn";
      btn.textContent = slot.name;
      btn.onclick = () => loadNames(slot);
      slotsEl.appendChild(btn);
    });
  }
}

async function loadNames(slot) {
  slotTitle.textContent = slot.name;
  namesSection.style.display = "block";
  successSection.style.display = "none";

  const { data } = await supabase
    .from("signups")
    .select("*")
    .eq("slot_id", slot.id)
    .order("full_name");

  currentSignups = data;
  renderNames(data);
}

function renderNames(list) {
  namesEl.innerHTML = "";

  list.forEach(person => {
    const btn = document.createElement("button");
    btn.className = "btn btn-light name-btn";
    btn.textContent = person.full_name;

    if (person.checked_in) {
      btn.classList.add("checked");
      btn.textContent += " (checked in)";
    } else {
      btn.onclick = () => checkIn(person);
    }

    namesEl.appendChild(btn);
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  renderNames(
    currentSignups.filter(p =>
      p.full_name.toLowerCase().includes(q)
    )
  );
});

async function checkIn(person) {
  await supabase
    .from("signups")
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString()
    })
    .eq("id", person.id);

  namesSection.style.display = "none";
  successSection.style.display = "block";
}
