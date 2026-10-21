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


function buildGalleryRows(photoUrls) {
  const groups = [[], [], [], []];

  photoUrls.forEach((url, i) => {
    if (typeof url === "string" && url.trim()) {
      groups[i % 4].push(url);
    }
  });

  const directions = [
    "scrollLeft",
    "scrollRight",
    "scrollLeft",
    "scrollRight"
  ];

  for (let rowNum = 1; rowNum <= 4; rowNum++) {
    const row = document.getElementById(`gallery-row-${rowNum}`);
    const groupImages = groups[rowNum - 1];

    if (!row || groupImages.length === 0) continue;

    const track = document.createElement("div");
    track.className = "gallery-track";
    track.style.visibility = "hidden";

    const images = groupImages.map(url => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Wedding photo";
      img.loading = "eager";
      img.decoding = "async";
      img.draggable = false;

      // Avoid a broken image icon if a URL fails.
      img.onerror = () => {
        img.remove();
        console.error("Gallery image failed to load:", url);
      };

      track.appendChild(img);
      return img;
    });

    row.replaceChildren(track);

    // Wait for image loading to settle before starting animation.
    Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();

      return new Promise(resolve => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    })).then(() => {
      const loadedImages = Array.from(track.children);

      if (loadedImages.length === 0) {
        track.style.visibility = "visible";
        return;
      }

      // Duplicate the successfully loaded images for the loop.
      loadedImages.forEach(img => {
        const clone = img.cloneNode(true);
        clone.onerror = () => clone.remove();
        track.appendChild(clone);
      });

      const seconds = Math.max(30, loadedImages.length * 7);

      track.style.animation =
        `${directions[rowNum - 1]} ${seconds}s linear infinite`;

      track.style.visibility = "visible";
    });
  }
}


// ---- Details: Google Maps link ----
function initMapsLink(){
  const address = "Padre Serra Parish, Camarillo, CA";
  const link = document.getElementById('maps-link');
  link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}