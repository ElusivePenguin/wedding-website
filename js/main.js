// ==== CONFIG ====
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKWDH_IfVH9DKYaZm_N8jXNOwysJJpkiqOOi_O3n-Yxui-ESTPD1KdeM8wuCff4Blzvg/exec";

// ==== PASSWORD GATE ====
const gate = document.getElementById('gate');
const gateInput = document.getElementById('gate-input');
const gateButton = document.getElementById('gate-button');
const gateError = document.getElementById('gate-error');
const site = document.getElementById('site');

function checkPassword(){
  const pw = gateInput.value.trim();
  if(!pw){
    gateError.textContent = "Please enter a password.";
    return;
  }

  gateButton.disabled = true;
  gateButton.textContent = "Checking...";
  gateError.textContent = "";

  fetch(`${SCRIPT_URL}?password=${encodeURIComponent(pw)}`)
    .then(res => res.json())
    .then(data => {
      if(data.status === "success"){
        gate.classList.add('hidden');
        site.classList.remove('hidden');
        initSite();
      } else {
        gateError.textContent = "Incorrect password. Please try again.";
        gateButton.disabled = false;
        gateButton.textContent = "Enter";
      }
    })
    .catch(err => {
      gateError.textContent = "Something went wrong. Please try again.";
      gateButton.disabled = false;
      gateButton.textContent = "Enter";
      console.error(err);
    });
}

gateButton.addEventListener('click', checkPassword);
gateInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter') checkPassword();
});

// ==== SITE INIT (runs once, after password success) ====
function initSite(){
  initFireflies();
  initGallery();
  initMapsLink();
}

// ---- Fireflies: runs once per section, so they appear throughout the page ----
function initFireflies(){
  addFireflies('.hero', 24, 30, 90);
  addFireflies('.gallery-section', 14, 8, 92);
  addFireflies('.details-section', 12, 8, 92);
  addFireflies('.rsvp-section', 12, 8, 92);
}

function addFireflies(containerSelector, count, topMinPercent, topMaxPercent){
  const container = document.querySelector(containerSelector);
  if(!container) return;

  for(let i = 0; i < count; i++){
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = (Math.random() * 100) + '%';
    f.style.top = (topMinPercent + Math.random() * (topMaxPercent - topMinPercent)) + '%';
    f.style.animationDelay = (Math.random() * 8) + 's, ' + (Math.random() * 3) + 's';
    f.style.animationDuration = (7 + Math.random() * 6) + 's, ' + (2.5 + Math.random() * 2) + 's';
    container.appendChild(f);
  }
}

// ---- Gallery ----
// PLACEHOLDER photos for now - replace this array later with real
// Google Drive "C" (rotating pool) photo URLs once that's wired up.
// Split into 4 disjoint groups so the same photo never appears in two rows at once.
const galleryPhotos = [
  "https://picsum.photos/seed/wed01/320/220",
  "https://picsum.photos/seed/wed02/320/220",
  "https://picsum.photos/seed/wed03/320/220",
  "https://picsum.photos/seed/wed04/320/220",
  "https://picsum.photos/seed/wed05/320/220",
  "https://picsum.photos/seed/wed06/320/220",
  "https://picsum.photos/seed/wed07/320/220",
  "https://picsum.photos/seed/wed08/320/220",
  "https://picsum.photos/seed/wed09/320/220",
  "https://picsum.photos/seed/wed10/320/220",
  "https://picsum.photos/seed/wed11/320/220",
  "https://picsum.photos/seed/wed12/320/220",
  "https://picsum.photos/seed/wed13/320/220",
  "https://picsum.photos/seed/wed14/320/220",
  "https://picsum.photos/seed/wed15/320/220",
  "https://picsum.photos/seed/wed16/320/220",
  "https://picsum.photos/seed/wed17/320/220",
  "https://picsum.photos/seed/wed18/320/220",
  "https://picsum.photos/seed/wed19/320/220",
  "https://picsum.photos/seed/wed20/320/220"
];

function initGallery(){
  const groups = [[], [], [], []];
  galleryPhotos.forEach((url, i) => {
    groups[i % 4].push(url);
  });

  for(let rowNum = 1; rowNum <= 4; rowNum++){
    const row = document.getElementById(`gallery-row-${rowNum}`);
    const track = document.createElement('div');
    track.className = 'gallery-track';

    const groupImages = groups[rowNum - 1];
    const doubled = groupImages.concat(groupImages);

    doubled.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = "Wedding photo";
      track.appendChild(img);
    });

    row.appendChild(track);
  }
}

// ---- Details: Google Maps link ----
function initMapsLink(){
  const address = "Padre Serra Parish, Camarillo, CA";
  const link = document.getElementById('maps-link');
  link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}