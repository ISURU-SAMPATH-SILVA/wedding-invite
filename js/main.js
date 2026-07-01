/* ============================================================
   main.js — invitation page interactivity
   ============================================================ */

/* ---- Wedding configuration (edit here to reuse for another couple) ---- */
const WEDDING = {
  groom: 'Chamara',
  bride: 'Saduni',
  dateISO: '2026-07-25T16:00:00',
  ceremony: { name: 'Temple of the Sacred Tooth Relic', time: '10:00 AM', place: '85/1 Colombo Main Rd, Balapitiya 80550 Sri Lanka' },
  reception:{ name: 'Earl\'s Regency Hotel', time: '4:30 PM', place: '85/1 Colombo Main Rd, Balapitiya 80550 Sri Lanka' },
  rsvpDeadlineISO: '2026-06-25'
};

/* ---------------- Envelope Opener Logic ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const openBtn = document.getElementById('openEnvelopeBtn');
  const envelope = document.getElementById('weddingEnvelope');

  if (openBtn && envelopeWrapper) {
    
    const openEnvelope = () => {
      envelopeWrapper.classList.add('open'); 
      
      
      setTimeout(() => {
        envelopeWrapper.classList.add('fade-out');
      }, 1200);
    };

    openBtn.addEventListener('click', (e) => {
      e.stopPropagation(); 
      openEnvelope();
    });

    envelope.addEventListener('click', openEnvelope);
  }
});

/* ---------------- Countdown ---------------- */
function startCountdown(){
  const target = new Date(WEDDING.dateISO).getTime();
  const els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs'),
  };
  function tick(){
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if(els.d) els.d.textContent = String(d).padStart(2,'0');
    if(els.h) els.h.textContent = String(h).padStart(2,'0');
    if(els.m) els.m.textContent = String(m).padStart(2,'0');
    if(els.s) els.s.textContent = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------------- Calendar ---------------- */
function renderCalendar(){
  const date = new Date(WEDDING.dateISO);
  const year = date.getFullYear();
  const month = date.getMonth();
  const theDay = date.getDate();

  const monthLabel = document.getElementById('cal-month');
  const yearLabel = document.getElementById('cal-year');
  if(monthLabel) monthLabel.textContent = date.toLocaleString('en-US', { month: 'long' });
  if(yearLabel) yearLabel.textContent = year;

  const grid = document.getElementById('cal-grid');
  if(!grid) return;

  const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let html = dows.map(d => `<div class="dow">${d}</div>`).join('');

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for(let i=0;i<firstDow;i++) html += `<div class="day empty"></div>`;
  for(let day=1; day<=daysInMonth; day++){
    html += `<div class="day${day===theDay ? ' the-day' : ''}">${day}</div>`;
  }
  grid.innerHTML = html;

  const bigDay = document.getElementById('big-day-label');
  if(bigDay){
    bigDay.textContent = date.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  }
}

function downloadICS(){
  const start = new Date(WEDDING.dateISO);
  const end = new Date(start.getTime() + 5*3600000);
  const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,
    `SUMMARY:${WEDDING.groom} & ${WEDDING.bride} — Wedding Celebration`,
    `LOCATION:${WEDDING.ceremony.place}`,
    `DESCRIPTION:Ceremony at ${WEDDING.ceremony.name}, reception to follow at ${WEDDING.reception.name}.`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type:'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${WEDDING.groom}-${WEDDING.bride}-wedding.ics`;
  a.click();
}

function googleCalendarLink(){
  const start = new Date(WEDDING.dateISO);
  const end = new Date(start.getTime() + 5*3600000);
  const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  const params = new URLSearchParams({
    action:'TEMPLATE',
    text:`${WEDDING.groom} & ${WEDDING.bride} — Wedding Celebration`,
    dates:`${fmt(start)}/${fmt(end)}`,
    location: WEDDING.ceremony.place,
    details: `Ceremony at ${WEDDING.ceremony.name}, reception to follow at ${WEDDING.reception.name}.`
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/* ---------------- Gallery ---------------- */
function initGallery(){
  const track = document.getElementById('gallery-track');
  if(!track) return;
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById('gallery-dots');
  const countLabel = document.getElementById('gallery-count');
  let index = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    if(i===0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function update(){
    track.style.transform = `translateX(-${index * 100}%)`;
    Array.from(dotsWrap.children).forEach((d,i) => d.classList.toggle('active', i===index));
    if(countLabel) countLabel.textContent = `${index+1} / ${slides.length}`;
  }
  function goTo(i){ index = (i + slides.length) % slides.length; update(); }

  document.getElementById('gallery-prev')?.addEventListener('click', () => goTo(index-1));
  document.getElementById('gallery-next')?.addEventListener('click', () => goTo(index+1));

  let autoplay = setInterval(() => goTo(index+1), 1500);
  const galleryEl = document.getElementById('gallery');
  galleryEl?.addEventListener('mouseenter', () => clearInterval(autoplay));
  galleryEl?.addEventListener('mouseleave', () => autoplay = setInterval(() => goTo(index+1), 1500));

  update();
}

/* ---------------- RSVP form ---------------- */
function initRSVP(){
  const form = document.getElementById('rsvp-form');
  if(!form) return;

  const deadline = document.getElementById('rsvp-deadline-label');
  if(deadline){
    deadline.textContent = 'Kindly respond by ' + new Date(WEDDING.rsvpDeadlineISO).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
  }

  let rsvpChoice = 'accepted';
  const acceptBtn = document.getElementById('rsvp-accept');
  const declineBtn = document.getElementById('rsvp-decline');
  const guestsField = document.getElementById('rsvp-guests-field');

  function setChoice(choice){
    rsvpChoice = choice;
    acceptBtn.classList.toggle('active', choice === 'accepted');
    acceptBtn.classList.toggle('accept', choice === 'accepted');
    declineBtn.classList.toggle('active', choice === 'declined');
    declineBtn.classList.toggle('decline', choice === 'declined');
    guestsField.style.display = choice === 'accepted' ? 'block' : 'none';
  }
  acceptBtn.addEventListener('click', () => setChoice('accepted'));
  declineBtn.addEventListener('click', () => setChoice('declined'));
  setChoice('accepted');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value.trim();
    if(!name) return;

    const entry = {
      name,
      phone: document.getElementById('rsvp-phone').value.trim(),
      email: document.getElementById('rsvp-email').value.trim(),
      guests: rsvpChoice === 'accepted' ? Number(document.getElementById('rsvp-guests').value || 1) : null,
      note: document.getElementById('rsvp-note').value.trim(),
      rsvp: rsvpChoice
    };
    Storage.addResponse(entry);

    form.style.display = 'none';
    const success = document.getElementById('rsvp-success');
    if(success){
      success.style.display = 'block';
      success.textContent = rsvpChoice === 'accepted'
        ? `Thank you, ${name}! We can't wait to celebrate with you. 💛`
        : `Thank you for letting us know, ${name}. You'll be missed.`;
    }
  });
}

/* ---------------- Init ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  startCountdown();
  renderCalendar();
  initGallery();
  initRSVP();

  document.getElementById('gcal-link')?.setAttribute('href', googleCalendarLink());
  document.getElementById('ics-link')?.addEventListener('click', (e) => { e.preventDefault(); downloadICS(); });
});
