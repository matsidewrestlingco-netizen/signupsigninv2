export function loadNavbar() {
  console.log("loadNavbar() called");

  // WORKS FROM ANY DIRECTORY IN YOUR STATIC SITE
  const path = "/signupsigninv2/components/navbar.html";

  fetch(path)
    .then(res => {
      console.log("fetch response:", res.status);
      return res.text();
    })
    .then(html => {
      console.log("navbar HTML loaded:", html);
      const target = document.getElementById("navbar");
      if (target) {
        target.innerHTML = html;
        console.log("navbar injected successfully");
      } else {
        console.log("ERROR: #navbar not found");
      }
    })
    .catch(err => console.error("Navbar failed to load:", err));
}
