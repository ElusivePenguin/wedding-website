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
        initSite(); // starts fireflies etc. now that the site is visible
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

// ==== FIREFLIES (only runs once the site is unlocked) ====
function initSite(){
  const hero = document.querySelector('.hero');
  const fireflyCount = 24;

  for(let i = 0; i < fireflyCount; i++){
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = (Math.random() * 100) + '%';
    f.style.top = (30 + Math.random() * 60) + '%';
    f.style.animationDelay = (Math.random() * 8) + 's, ' + (Math.random() * 3) + 's';
    f.style.animationDuration = (7 + Math.random() * 6) + 's, ' + (2.5 + Math.random() * 2) + 's';
    hero.appendChild(f);
  }
}