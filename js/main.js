// ==== CONFIG ====
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKWDH_IfVH9DKYaZm_N8jXNOwysJJpkiqOOi_O3n-Yxui-ESTPD1KdeM8wuCff4Blzvg/exec";

// ==== PASSWORD GATE ====
const gate = document.getElementById('gate');
const gateInput = document.getElementById('gate-input');
const gateButton = document.getElementById('gate-button');
const gateError = document.getElementById('gate-error');
const site = document.getElementById('site');

// pulls the group slug out of the URL, e.g. dulocwasbooked.us/weazal -> "weazal"
function getGroupSlugFromUrl(){
  const path = window.location.pathname.replace(/^\/|\/$/g, ''); // strip leading/trailing slashes
  return path; // empty string if visiting the bare domain
}

function checkPassword(){
  const pw = gateInput.value.trim();
  if(!pw){
    gateError.textContent = "Please enter a password.";
    return;
  }

  gateButton.disabled = true;
  gateButton.textContent = "Checking...";
  gateError.textContent = "";

  const slug = getGroupSlugFromUrl();

  fetch(`${SCRIPT_URL}?password=${encodeURIComponent(pw)}&slug=${encodeURIComponent(slug)}`)
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

// ---- Gallery ----
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
  // smaller thumbnails: photos only display ~240x180, so w480 is plenty sharp
  const smallUrls = photoUrls.map(url => url.replace('=w1000', '=w480'));

  const groups = [[], [], [], []];
  smallUrls.forEach((url, i) => {
    groups[i % 4].push(url);
  });

  const directions = ['scrollLeft', 'scrollRight', 'scrollLeft', 'scrollRight'];

  // each item = one photo plus its two <img> slots (original + seamless-loop copy)
  const rowItems = [[], [], [], []];

  for(let rowNum = 1; rowNum <= 4; rowNum++){
    const row = document.getElementById(`gallery-row-${rowNum}`);
    const groupImages = groups[rowNum - 1];

    if(groupImages.length === 0) continue;

    const track = document.createElement('div');
    track.className = 'gallery-track';

    const firstHalf = [];
    const secondHalf = [];

    // images are created empty; the loader below fills in src as each photo arrives
    groupImages.forEach(() => {
      const img = document.createElement('img');
      img.alt = "";
      firstHalf.push(img);
      track.appendChild(img);
    });
    groupImages.forEach(() => {
      const img = document.createElement('img');
      img.alt = "";
      secondHalf.push(img);
      track.appendChild(img);
    });

    groupImages.forEach((url, i) => {
      rowItems[rowNum - 1].push({ url: url, imgs: [firstHalf[i], secondHalf[i]] });
    });

    const seconds = Math.max(30, groupImages.length * 7);
    track.style.animation = `${directions[rowNum - 1]} ${seconds}s linear infinite`;

    row.appendChild(track);
  }

  // interleave across rows so all 4 rows fill in left-to-right together
  const queue = [];
  const maxLen = Math.max(...rowItems.map(r => r.length));
  for(let i = 0; i < maxLen; i++){
    for(let r = 0; r < 4; r++){
      if(rowItems[r][i]) queue.push(rowItems[r][i]);
    }
  }

  loadGalleryImages(queue, 8);
}

// loads photos as a steady stream (not one big burst), retrying any that fail
function loadGalleryImages(items, concurrency){
  let next = 0;
  let active = 0;

  function pump(){
    while(active < concurrency && next < items.length){
      active++;
      attempt(items[next++], 0);
    }
  }

  function attempt(item, tries){
    const probe = new Image();

    probe.onload = function(){
      item.imgs.forEach(img => {
        img.src = item.url;   // served instantly from the browser cache
        img.alt = "Wedding photo";
      });
      active--;
      pump();
    };

    probe.onerror = function(){
      if(tries < 2){
        setTimeout(() => attempt(item, tries + 1), 1500 * (tries + 1));
      } else {
        active--;   // give up on this one so it doesn't block the others
        pump();
      }
    };

    probe.src = item.url;
  }

  pump();
}

// ---- Details: Google Maps link ----
function initMapsLink(){
  const address = "Padre Serra Parish, Camarillo, CA";
  const link = document.getElementById('maps-link');
  link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}