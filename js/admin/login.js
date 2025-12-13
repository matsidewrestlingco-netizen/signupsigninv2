import { supabase } from "../supabaseClient.js";
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

const form = document.getElementById("loginForm");
const statusEl = document.getElementById("status");

const params = new URLSearchParams(window.location.search);
const next = params.get("next") || "/admin/events.html";

// If already logged in, bounce to next
(async function autoRedirectIfLoggedIn() {
  const { data } = await supabase.auth.getUser();
  if (data?.user) window.location.href = next;
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Signing in…";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("LOGIN ERROR:", error);
    statusEl.textContent = error.message || "Login failed.";
    return;
  }

  window.location.href = next;
});
