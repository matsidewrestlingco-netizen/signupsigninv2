import { supabase } from "../supabaseClient.js";
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

const eventSelect = document.getElementById("eventSelect");
const exportBtn = document.getElementById("exportBtn");

const eventHeader = document.getElementById("eventHeader");
const eventTitle = document.getElementById("eventTitle");
const eventMeta = document.getElementById("eventMeta");
const eventStatusBadge = document.getElementById("eventStatusBadge");

const summarySection = document.getElementById("summarySection");
const tablesSection = document.getElementById("tablesSection");
const emptyState = document.getElementById("emptyState");

const sumSlots = document.getElementById("sumSlots");
const sumSlotsSub = document.getElementById("sumSlotsSub");
const sumNeeded = document.getElementById("sumNeeded");
const sumFilled = document.getElementById("sumFilled");
const sumPct = document.getElementById("sumPct");
const sumRemaining = document.getElementById("sumRemaining");

const readinessWrap = document.getElementById("readinessWrap");
const criticalWrap = document.getElementById("criticalWrap");

let currentEvent = null;
let currentSlots = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadEventsList();
  showEmpty();
});

eventSelect.addEventListener("change", async () => {
  const id = eventSelect.value || null;
  if (!id) return showEmpty();
  await loadReportsForEvent(id);
});

exportBtn.addEventListener("click", () => {
  if (!currentEvent) return;
  downloadCsv(currentEvent, currentSlots);
});

/* -------------------------
    UI STATES
-------------------------- */
function showEmpty() {
  currentEvent = null;
  currentSlots = [];
  exportBtn.disabled = true;

  eventHeader.style.display = "none";
  summarySection.style.display = "none";
  tablesSection.style.display = "none";
  emptyState.style.display = "block";

  readinessWrap.innerHTML = "";
  criticalWrap.innerHTML = "";
}

function showLoaded() {
  exportBtn.disabled = false;
  eventHeader.style.display = "block";
  summarySection.style.display = "block";
  tablesSection.style.display = "block";
  emptyState.style.display = "none";
}

/* -------------------------
    LOAD EVENTS LIST
-------------------------- */
async function loadEventsList() {
  eventSelect.innerHTML = `<option value="">Loading events…</option>`;

  const { data: events, error } = await supabase
    .from("events")
    .select("id,title,start_time")
    .order("start_time", { ascending: false });

  if (error) {
    console.error(error);
    eventSelect.innerHTML = `<option value="">Error loading events</option>`;
    return;
  }

  if (!events || events.length === 0) {
    eventSelect.innerHTML = `<option value="">No events found</option>`;
    return;
  }

  eventSelect.innerHTML = `<option value="">Select an event…</option>`;
  for (const ev of events) {
    const opt = document.createElement("option");
    opt.value = ev.id;
    opt.textContent = `${ev.title} — ${formatEventDate(ev.start_time)}`;
    eventSelect.appendChild(opt);
  }
}

/* -------------------------
    LOAD REPORTS
-------------------------- */
async function loadReportsForEvent(eventId) {
  // Load event
  const { data: ev, error: evErr } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (evErr || !ev) {
    console.error(evErr);
    showEmpty();
    return;
  }

  // Load slots + signups
  const { data: slots, error: slotsErr } = await supabase
    .from("slots")
    .select("id,event_id,name,category,quantity_total,start_time,end_time,sort_order,description,signups(full_name,email)")
    .eq("event_id", eventId)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (slotsErr) {
    console.error(slotsErr);
    showEmpty();
    return;
  }

  currentEvent = ev;
  currentSlots = slots || [];

  renderHeader(ev);
  renderSummary(ev, currentSlots);
  renderTables(ev, currentSlots);

  showLoaded();
}

/* -------------------------
    RENDER
-------------------------- */
function renderHeader(ev) {
  eventTitle.textContent = ev.title;
  eventMeta.textContent = formatEventDateTime(ev.start_time);

  // status badge is based on completion %
  const metrics = computeMetrics(ev, currentSlots);
  const badge = statusFromPct(metrics.pctComplete);

  eventStatusBadge.className = `badge ${badge.className}`;
  eventStatusBadge.textContent = badge.label;
}

function renderSummary(ev, slots) {
  const m = computeMetrics(ev, slots);

  sumSlots.textContent = m.totalSlots;
  sumSlotsSub.textContent = `${m.totalCategories} categories`;

  sumNeeded.textContent = m.totalNeeded;
  sumFilled.textContent = m.totalFilled;

  sumPct.textContent = `${m.pctComplete}%`;
  sumRemaining.textContent = `${m.totalRemaining} spots remaining`;
}

function renderTables(ev, slots) {
  const rows = buildReadinessRows(ev, slots);

  // Readiness table
  readinessWrap.innerHTML = buildTableHtml(rows);

  // Critical table (filtered)
  const critical = rows.filter(r => r.statusKey === "crit");
  criticalWrap.innerHTML = critical.length
    ? buildTableHtml(critical)
    : `<div class="card"><div class="muted">No critical slots right now.</div></div>`;
}

/* -------------------------
    METRICS + STATUS
-------------------------- */
function computeMetrics(ev, slots) {
  const totalSlots = slots.length;

  const categories = new Set();
  let totalNeeded = 0;
  let totalFilled = 0;

  for (const s of slots) {
    categories.add((s.category || "Other").trim());
    totalNeeded += (s.quantity_total || 0);
    totalFilled += (s.signups?.length || 0);
  }

  const totalRemaining = Math.max(0, totalNeeded - totalFilled);
  const pctComplete = totalNeeded === 0 ? 100 : Math.round((totalFilled / totalNeeded) * 100);

  return {
    totalSlots,
    totalCategories: categories.size,
    totalNeeded,
    totalFilled,
    totalRemaining,
    pctComplete
  };
}

function statusFromPct(pct) {
  if (pct >= 100) return { label: "READY", className: "ready" };
  if (pct >= 80)  return { label: "AT RISK", className: "risk" };
  return { label: "CRITICAL", className: "crit" };
}

function statusForSlot(ev, slot) {
  const filled = slot.signups?.length || 0;
  const remaining = (slot.quantity_total || 0) - filled;

  if (remaining <= 0) return { label: "READY", className: "ready", key: "ready" };

  // Determine urgency based on start datetime
  const startDt = slotStartDateTime(ev, slot);
  const now = new Date();
  const hoursUntil = (startDt - now) / (1000 * 60 * 60);

  if (!isFinite(hoursUntil)) {
    // if we couldn't compute time, treat as understaffed (not critical)
    return { label: "UNDERSTAFFED", className: "under", key: "under" };
  }

  if (hoursUntil <= 24) return { label: "CRITICAL", className: "crit", key: "crit" };
  return { label: "UNDERSTAFFED", className: "under", key: "under" };
}

/* -------------------------
    READINESS ROWS
-------------------------- */
function buildReadinessRows(ev, slots) {
  return slots.map(slot => {
    const category = slot.category || "Other";
    const needed = slot.quantity_total || 0;
    const filled = slot.signups?.length || 0;
    const remaining = Math.max(0, needed - filled);

    const status = statusForSlot(ev, slot);

    return {
      slotName: slot.name,
      category,
      needed,
      filled,
      remaining,
      time: slot.start_time ? `${formatTime(slot.start_time)}–${formatTime(slot.end_time || slot.start_time)}` : "—",
      statusLabel: status.label,
      statusClass: status.className,
      statusKey: status.key
    };
  });
}

/* -------------------------
    TABLE HTML
-------------------------- */
function buildTableHtml(rows) {
  if (!rows || rows.length === 0) {
    return `<div class="card"><div class="muted">No data.</div></div>`;
  }

  const thead = `
    <table>
      <thead>
        <tr>
          <th>Slot</th>
          <th>Category</th>
          <th>Time</th>
          <th>Needed</th>
          <th>Filled</th>
          <th>Remaining</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  const tbody = rows.map(r => `
    <tr>
      <td><strong>${escapeHtml(r.slotName)}</strong></td>
      <td>${escapeHtml(r.category)}</td>
      <td>${escapeHtml(r.time)}</td>
      <td>${r.needed}</td>
      <td>${r.filled}</td>
      <td><strong>${r.remaining}</strong></td>
      <td><span class="status-pill ${r.statusClass}">${r.statusLabel}</span></td>
    </tr>
  `).join("");

  return `${thead}${tbody}</tbody></table>`;
}

/* -------------------------
    CSV EXPORT
-------------------------- */
function downloadCsv(ev, slots) {
  const lines = [];
  const headers = [
    "event_title",
    "event_start",
    "category",
    "slot_name",
    "slot_start_time",
    "slot_end_time",
    "quantity_total",
    "filled",
    "remaining",
    "volunteer_name",
    "volunteer_email"
  ];
  lines.push(headers.join(","));

  for (const slot of slots) {
    const filled = slot.signups?.length || 0;
    const remaining = Math.max(0, (slot.quantity_total || 0) - filled);

    const signups = (slot.signups && slot.signups.length) ? slot.signups : [{ full_name: "", email: "" }];

    for (const su of signups) {
      const row = [
        ev.title,
        formatEventDateTime(ev.start_time),
        slot.category || "Other",
        slot.name,
        slot.start_time || "",
        slot.end_time || "",
        String(slot.quantity_total || 0),
        String(filled),
        String(remaining),
        su.full_name || "",
        su.email || ""
      ].map(csvEscape);

      lines.push(row.join(","));
    }
  }

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `signups_${slugify(ev.title)}_${formatDateForFile(ev.start_time)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/* -------------------------
    DATE/TIME HELPERS
-------------------------- */
function slotStartDateTime(ev, slot) {
  // Base date from event start_time (timestamp)
  const base = new Date(ev.start_time);
  if (isNaN(base.getTime())) return new Date(NaN);

  // If slot.start_time is null, use event start_time as the slot's time anchor
  const t = slot.start_time || timeFromDate(base);
  const parts = parseTime(t);
  if (!parts) return new Date(NaN);

  const dt = new Date(base);
  dt.setHours(parts.h, parts.m, parts.s, 0);
  return dt;
}

function parseTime(t) {
  if (!t) return null;
  const [hh, mm, ss] = t.split(":");
  const h = parseInt(hh, 10);
  const m = parseInt(mm, 10);
  const s = parseInt(ss || "0", 10);
  if (![h, m, s].every(n => Number.isFinite(n))) return null;
  return { h, m, s };
}

function timeFromDate(d) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatTime(val) {
  if (!val) return "";
  const [h, m] = val.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = ((hour + 11) % 12 + 1);
  return `${displayHour}:${m} ${suffix}`;
}

function formatEventDate(ts) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function formatEventDateTime(ts) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatDateForFile(ts) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "unknown-date";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* -------------------------
    STRING HELPERS
-------------------------- */
function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function slugify(str) {
  return String(str || "event")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

