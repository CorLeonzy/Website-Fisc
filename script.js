/* =========================
   Interactions: contact dropdown, review (localStorage), order (WhatsApp), smooth scroll, footer fade-in
   ========================= */

/* ---------- CONFIG ---------- */
const WA_NUMBER = '6287779514340'; // nomor WA yang lo konfirmasi (tanpa tanda +)
const REVIEWS_KEY = 'fisc_reviews_v1';

/* ---------- HELPERS ---------- */
function openWhatsApp(productName){
  const msg = encodeURIComponent(`Halo FISC, saya mau pesan: ${productName}`);
  const url = `https://wa.me/${WA_NUMBER}?text=${msg}`;
  window.open(url, '_blank');
}

/* ---------- SMOOTH SCROLL ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', function(e){
    const target = this.getAttribute('href');
    if(target && target.startsWith('#')){
      e.preventDefault();
      const el = document.querySelector(target);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

/* ---------- ORDER BUTTONS (WA) ---------- */
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.order-btn');
  if(btn){
    const name = btn.dataset.name || btn.textContent.trim();
    openWhatsApp(name);
  }
});

/* ---------- CONTACT DROPDOWN (ANIMATED) ---------- */
function setupDropdown(btnId, dropId){
  const btn = document.getElementById(btnId);
  const drop = document.getElementById(dropId);
  if(!btn || !drop) return;

  btn.addEventListener('click', (ev)=>{
    ev.stopPropagation();
    const isOpen = drop.classList.contains('show');
    document.querySelectorAll('.contact-dropdown').forEach(d => d.classList.remove('show'));
    if(!isOpen) {
      drop.classList.add('show');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      drop.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}
setupDropdown('contactBtn','contactDropdown');
setupDropdown('contactBtn2','contactDropdown2');

// close dropdown on outside click
document.addEventListener('click', (e)=>{
  if(!e.target.closest('.contact-dropdown') && !e.target.closest('.nav-contact') && !e.target.closest('#contactBtn') && !e.target.closest('#contactBtn2')){
    document.querySelectorAll('.contact-dropdown').forEach(d => d.classList.remove('show'));
    document.querySelectorAll('.nav-contact').forEach(b => b.setAttribute('aria-expanded','false'));
  }
});

/* ---------- RATING STARS ---------- */
let currentRating = 0;
const ratingEl = document.getElementById('rating');
if(ratingEl){
  const stars = Array.from(ratingEl.querySelectorAll('.star'));
  stars.forEach(s=>{
    s.addEventListener('mouseenter', ()=> {
      const v = Number(s.dataset.value);
      stars.forEach(st => st.classList.toggle('hover', Number(st.dataset.value) <= v));
    });
    s.addEventListener('mouseleave', ()=> stars.forEach(st => st.classList.remove('hover')));
    s.addEventListener('click', ()=> {
      currentRating = Number(s.dataset.value);
      stars.forEach(st => st.classList.toggle('selected', Number(st.dataset.value) <= currentRating));
    });
  });
}

/* ---------- REVIEWS (localStorage) ---------- */
function loadReviews(){
  const raw = localStorage.getItem(REVIEWS_KEY);
  try{
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveReviews(list){
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
}
function renderReviews(){
  const list = loadReviews();
  const container = document.getElementById('reviewsList');
  if(!container) return;
  container.innerHTML = '';
  if(list.length === 0){
    container.innerHTML = '<p class="small-muted" style="text-align:center;color:#6b5b4b">Belum ada review. Jadilah yang pertama!</p>';
    return;
  }
  list.slice().reverse().forEach(r=>{
    const item = document.createElement('div');
    item.className = 'review-item';
    item.innerHTML = `<strong>${escapeHtml(r.name)}</strong> <span style="color:${getComputedStyle(document.documentElement).getPropertyValue('--gold-soft') || '#caa54a'}">${'★'.repeat(r.rating)}</span><p style="margin-top:8px;color:#5b473a">${escapeHtml(r.text)}</p>`;
    container.appendChild(item);
  });
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderReviews();

  const submitReview = document.getElementById('submitReview');
  if(submitReview){
    submitReview.addEventListener('click', ()=>{
      const nameInput = document.getElementById('reviewName');
      const textInput = document.getElementById('reviewText');
      const name = (nameInput && nameInput.value.trim()) || 'Anon';
      const text = (textInput && textInput.value.trim()) || '';
      if(!text || currentRating === 0){
        alert('Isi komentar dan pilih bintang dulu ya :)');
        return;
      }
      const all = loadReviews();
      all.push({ name, text, rating: currentRating, ts: Date.now() });
      saveReviews(all);
      renderReviews();
      // reset
      if(textInput) textInput.value = '';
      if(nameInput) nameInput.value = '';
      currentRating = 0;
      const stars = ratingEl.querySelectorAll('.star');
      stars.forEach(s=> s.classList.remove('selected'));
    });
  }
});

/* ---------- SMALL NAV HOVER POLISH ---------- */
document.querySelectorAll('.main-nav a, .main-nav .nav-contact').forEach(el=>{
  el.addEventListener('mouseenter', ()=> el.style.transform='translateY(-3px)');
  el.addEventListener('mouseleave', ()=> el.style.transform='translateY(0)');
});

/* ---------- FOOTER FADE-IN (IntersectionObserver) ---------- */
(function footerObserver(){
  const footer = document.querySelector('.site-footer');
  if(!footer) return;
  const io = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        footer.classList.add('visible');
        io.unobserve(footer);
      }
    });
  }, {threshold: 0.15});
  io.observe(footer);
})();
