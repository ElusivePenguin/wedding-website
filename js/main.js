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

// ---- Fireflies ----
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

// ---- Gallery: pulls real photos from Google Drive "Website Photos" folder ----
// Images are now served through the Apps Script itself (not linked directly to Drive),
// which is more reliable and lets the folder stay private.
function initGallery(){
  fetch(`${SCRIPT_URL}?action=gallery`)
    .then(res => res.json())
    .then(data => {
      if(data.status === "success" && data.photos.length > 0){
        buildGalleryRows(data.photos);
      } else {
        console.warn("No gallery photos found.");
      }
    })
    .catch(err => {
      console.error("Failed to load gallery photos:", err);
    });
}

function buildGalleryRows(photoUrls){
  // split photos into 4 disjoint groups so the same photo never
  // appears in two rows at the same time
  const groups = [[], [], [], []];
  photoUrls.forEach((url, i) => {
    groups[i % 4].push(url);
  });

  // rows alternate scroll direction for visual variety
  const directions = ['scrollLeft', 'scrollRight', 'scrollLeft', 'scrollRight'];

  for(let rowNum = 1; rowNum <= 4; rowNum++){
    const row = document.getElementById(`gallery-row-${rowNum}`);
    const groupImages = groups[rowNum - 1];

    if(groupImages.length === 0) continue;

    const track = document.createElement('div');
    track.className = 'gallery-track';

    // duplicate the group's images twice back-to-back so the
    // scrolling animation (translateX to -50%) loops seamlessly
    const doubled = groupImages.concat(groupImages);

    doubled.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = "Wedding photo";
      track.appendChild(img);
    });

    // speed scales with photo count so pace feels consistent
    // regardless of how many photos are in the folder
    const seconds = Math.max(30, groupImages.length * 7);
    track.style.animation = `${directions[rowNum - 1]} ${seconds}s linear infinite`;

    row.appendChild(track);
  }
}

// ---- Details: Google Maps link ----
function initMapsLink(){
  const address = "Padre Serra Parish, Camarillo, CA";
  const link = document.getElementById('maps-link');
  link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}