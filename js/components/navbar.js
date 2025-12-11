export function loadNavbar() {
  fetch("./components/navbar.html")
    .then(res => res.text())
    .then(html => {
      const target = document.getElementById("navbar");
      if (target) target.innerHTML = html;
    })
    .catch(err => console.error("Navbar failed to load:", err));
}
