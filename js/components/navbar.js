export function loadNavbar() {
  console.log("loadNavbar() called");

  fetch("./components/navbar.html")
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
