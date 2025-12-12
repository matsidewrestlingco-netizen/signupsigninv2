import { supabase } from "../../supabaseClient.js";

export async function requireAuth() {
  const { data, error } = await supabase.auth.getUser();

  if (error) console.warn("auth.getUser() error:", error);

  if (!data?.user) {
    const next = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    window.location.href =
      `/signupsigninv2/admin/login.html?next=${next}`;
    return null;
  }

  return data.user;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/signupsigninv2/admin/login.html";
}


