import { APP_VERSION } from "/js/config/version.js";

export async function loadFooter() {
  try {
    const res = await fetch("/components/footer.html");
    if (!res.ok) throw new Error("Footer not found");

    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);

    const versionEl = document.getElementById("footer-version");
    if (versionEl) {
      versionEl.textContent = APP_VERSION;
    }

  } catch (err) {
    console.warn("Footer failed to load:", err);
  }
}
