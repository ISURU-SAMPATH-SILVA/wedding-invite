/* ============================================================
   admin.js — couple/family dashboard
   Auth is intentionally simple (single shared passcode) since
   this is a static site with no backend. Swap PASSCODE before
   sharing the admin link with family.
   ============================================================ */
const ADMIN_SESSION_KEY = 'wedding_admin_authed';
const PASSCODE = 'admin!123';

function checkAuth(){
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'yes';
}

function showDashboard(){
  document.getElementById('admin-login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
  renderDashboard();
}

function initLogin(){
  const form = document.getElementById('admin-login-form');
  const error = document.getElementById('admin-error');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = document.getElementById('admin-pass').value.trim();
    if(value === PASSCODE){
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'yes');
      error.style.display = 'none';
      showDashboard();
    }else{
      error.style.display = 'block';
    }
  });
}

document.getElementById('admin-logout')?.addEventListener('click', () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  location.reload();
});

/* ---------------- Dashboard rendering ---------------- */
let activeFilter = 'all';

function renderDashboard(){
  const responses = Storage.getAll();

  const accepted = responses.filter(r => r.rsvp === 'accepted');
  const declined = responses.filter(r => r.rsvp === 'declined');
  const totalAttending = accepted.reduce((sum, r) => sum + (Number(r.guests) || 1), 0);

  document.getElementById('stat-responses').textContent = responses.length;
  document.getElementById('stat-accepted').textContent = accepted.length;
  document.getElementById('stat-declined').textContent = declined.length;
  document.getElementById('stat-attending').textContent = totalAttending;

  const shareInput = document.getElementById('share-link');
  shareInput.value = location.href.replace('admin.html', 'index.html');

  renderTable(responses);
}

function filteredResponses(){
  const all = Storage.getAll();
  if(activeFilter === 'accepted') return all.filter(r => r.rsvp === 'accepted');
  if(activeFilter === 'declined') return all.filter(r => r.rsvp === 'declined');
  return all;
}

function renderTable(all){
  const list = filteredResponses();
  const tbody = document.getElementById('guest-tbody');
  const emptyState = document.getElementById('empty-state');
  const tableWrap = document.getElementById('table-wrap');
  const countLabel = document.getElementById('table-count');

  countLabel.textContent = `Showing ${list.length} of ${all.length}`;

  if(list.length === 0){
    tableWrap.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  tableWrap.style.display = 'block';
  emptyState.style.display = 'none';

  tbody.innerHTML = list
    .slice()
    .sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(r => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.phone || '—')}</td>
        <td>${escapeHtml(r.email || '—')}</td>
        <td>${r.rsvp === 'accepted' ? (r.guests ?? 1) : '—'}</td>
        <td>${escapeHtml(r.note || '—')}</td>
        <td><span class="pill ${r.rsvp}">${r.rsvp === 'accepted' ? 'Accepted' : 'Declined'}</span></td>
        <td>${new Date(r.updatedAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</td>
        <td><button class="del-btn" data-id="${r.id}">Remove</button></td>
      </tr>
    `).join('');

  tbody.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if(confirm('Remove this response?')){
        Storage.removeResponse(btn.dataset.id);
        renderDashboard();
      }
    });
  });
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------- Init ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  if(checkAuth()) showDashboard();

  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeFilter = card.dataset.filter;
      renderTable(Storage.getAll());
    });
  });

  document.getElementById('copy-link')?.addEventListener('click', () => {
    const input = document.getElementById('share-link');
    input.select();
    navigator.clipboard?.writeText(input.value);
    const btn = document.getElementById('copy-link');
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = original, 1500);
  });

  document.getElementById('preview-invite')?.addEventListener('click', () => {
    window.open('index.html', '_blank');
  });
});
