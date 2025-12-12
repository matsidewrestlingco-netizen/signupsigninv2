const overlay = document.getElementById("splashOverlay");
const closeBtn = document.getElementById("closeSplash");
const continueBtn = document.getElementById("continueBtn");

const HAS_SEEN_SPLASH = "signupsignin_seen_splash";

// Show only once
if (!localStorage.getItem(HAS_SEEN_SPLASH)) {
  overlay.classList.remove("hidden");
}

function dismissSplash() {
  overlay.classList.add("hidden");
  localStorage.setItem(HAS_SEEN_SPLASH, "true");
}

closeBtn.addEventListener("click", dismissSplash);
continueBtn.addEventListener("click", dismissSplash);
