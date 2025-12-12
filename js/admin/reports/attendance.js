import { supabase } from "../supabaseClient.js";

export async function loadAttendance({ eventId, tableEl, summaryEl }) {
  const { data, error } = await supabase
    .from("signups")
    .select(`
      id,
      full_name,
      email,
      checked_in,
      checked_in_at,
      slots (
        name,
        category
      )
    `)
    .eq("event_id", eventId)
    .order("checked_in", { ascending: false })
    .order("full_name");

  if (error) {
    console.error(error);
    tableEl.innerHTML = "<tr><td>Error loading attendance</td></tr>";
    return;
  }

  // Summary
  const total = data.length;
  const checkedIn = data.filter(d => d.checked_in).length;

  if (summaryEl) {
    summaryEl.textContent =
      `${checkedIn} / ${total} volunteers checked in`;
  }

  tableEl.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Slot</th>
      <th>Category</th>
      <th>Status</th>
      <th>Time</th>
    </tr>
  `;

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.full_name}</td>
      <td>${row.email}</td>
      <td>${row.slots?.name ?? ""}</td>
      <td>${row.slots?.category ?? ""}</td>
      <td>${row.checked_in ? "✅ Checked In" : "❌ No Show"}</td>
      <td>${row.checked_in_at
        ? new Date(row.checked_in_at).toLocaleTimeString()
        : "—"
      }</td>
    `;

    tableEl.appendChild(tr);
  });
}
