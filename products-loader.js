/* ════════════════════════════════════════════════════
   products-loader.js — Dynamically loads cakes from
   Firebase Firestore and renders them into #pgrid
   ════════════════════════════════════════════════════ */

import { db } from './firebase-config.js';
import {
  collection, query, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const pgrid   = document.getElementById('pgrid');
const loading = document.getElementById('pgrid-loading');

const BADGE_MAP = {
  hot:  { text: '🔥 Best Seller',    cls: 'pcard-tag--hot'  },
  pop:  { text: '⭐ Popular',         cls: 'pcard-tag--pop'  },
  kids: { text: '🎂 Kids Favourite',  cls: 'pcard-tag--kids' },
};

/* ──── Build one product card HTML ──── */
function buildCard(cake, idx) {
  const delay  = (idx * 0.07).toFixed(2);
  const badge  = cake.badge ? BADGE_MAP[cake.badge] : null;
  const price  = Number(cake.price).toLocaleString('en-IN');
  const rating = cake.rating ?? 4.5;
  const reviews= cake.reviews ?? Math.floor(Math.random() * 200 + 50);

  const badgeHTML = badge
    ? `<span class="pcard-tag ${badge.cls}">${badge.text}</span>`
    : '';

  const oldPriceHTML = cake.oldPrice
    ? `<span class="pcard-old-price">&#8377;${Number(cake.oldPrice).toLocaleString('en-IN')}</span>`
    : '';

  const imgHTML = (cake.imageUrl && cake.imageUrl.length > 10)
    ? `<img src="${cake.imageUrl}" alt="${cake.name}" loading="lazy" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">🎂</div>`;

  return `
  <article class="pcard clickable-card" style="--d:${delay}s; cursor: pointer;" data-cat="${cake.category || 'all'}" data-id="${cake.id}">
    <div class="pcard-img">
      ${imgHTML}
      ${badgeHTML}
    </div>
    <div class="pcard-body">
      <h3 class="pcard-name">${cake.name}</h3>
      ${cake.description ? `<p class="pcard-desc">${cake.description}</p>` : ''}
      <div class="pcard-foot" style="margin-top: 12px;">
        <div>
          <span class="pcard-price">&#8377;${price}</span>
          ${oldPriceHTML}
        </div>
      </div>
    </div>
  </article>`;
}

/* ──── Render all cakes ──── */
function renderCakes(cakes) {
  if (!cakes.length) {
    pgrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:rgba(44,26,14,0.4);">
        <div style="font-size:3rem;margin-bottom:16px;">🎂</div>
        <p>No cakes available right now. Check back soon!</p>
      </div>`;
    return;
  }

  pgrid.innerHTML = cakes.map((cake, i) => buildCard(cake, i)).join('');

  /* Make all cards immediately visible (no scroll observer needed) */
  pgrid.querySelectorAll('.pcard').forEach(card => card.classList.add('visible'));

  /* Hook up route transition to product details */
  pgrid.querySelectorAll('.clickable-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const cakeId = card.dataset.id || '';
      
      // Page out transition
      document.body.style.transition = 'opacity 0.35s ease';
      document.body.style.opacity = '0';
      
      setTimeout(() => {
        window.location.href = `product.html?id=${cakeId}`;
      }, 350);
    });
  });

  /* Re-trigger JS reveal animations if available */
  if (typeof window.initReveal === 'function') window.initReveal();

  /* Re-attach filter tabs */
  const activeCat = document.querySelector('.ftab.active')?.dataset?.filter || 'all';
  if (activeCat !== 'all') filterCards(activeCat);
}

function applyFilters() {
  const activeCat = document.querySelector('.ftab.active')?.dataset?.filter || 'all';
  const searchTerm = document.getElementById('product-search')?.value.toLowerCase().trim() || '';

  document.querySelectorAll('.pcard').forEach(card => {
    const isCatMatch = activeCat === 'all' || card.dataset.cat === activeCat;
    const cakeName = card.querySelector('.pcard-name')?.textContent.toLowerCase() || '';
    const isTextMatch = cakeName.includes(searchTerm);
    
    card.style.display = (isCatMatch && isTextMatch) ? '' : 'none';
  });
}

function filterCards(cat) {
  // Kept for backwards compatibility if needed elsewhere
  applyFilters();
}

/* Listen to Search Bar */
const searchInput = document.getElementById('product-search');
if (searchInput) {
  searchInput.addEventListener('input', applyFilters);
}

/* Re-activate filter tabs to work on dynamic cards */
document.querySelectorAll('.ftab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ftab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    applyFilters();
  });
});

/* ──── Live listener — updates on any change ──── */
try {
  const q = query(collection(db, 'cakes'));

  onSnapshot(q, (snap) => {
    let cakes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Filter visible cakes & sort by createdAt (newest first)
    cakes = cakes
      .filter(c => c.visible !== false)
      .sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });
    if (loading) loading.remove();
    renderCakes(cakes);
  }, (err) => {
    console.error('products-loader:', err);
    if (loading) loading.remove();
    pgrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:#c00;">
        <p>⚠️ Could not load products. Please check Firebase setup.</p>
      </div>`;
  });
} catch (err) {
  console.error('products-loader init error:', err);
  if (loading) loading.remove();
}

/* ──── Auto-fill Order Form mapping from Detail Page ──── */
document.addEventListener('DOMContentLoaded', () => {
  // Wait 1200ms to ensure Firebase cakes render completely, establishing final page height
  setTimeout(() => {
    const pendingOrderName = sessionStorage.getItem('pendingOrderName');
    const pendingOrderPrice = sessionStorage.getItem('pendingOrderPrice');
    
    if (pendingOrderName) {
      const nameInput = document.getElementById('f-cakename');
      const priceDisplay = document.getElementById('f-priceDisplay');
      
      if (nameInput) {
        nameInput.value = pendingOrderName;
        nameInput.readOnly = true;
        nameInput.style.background = 'rgba(201,168,76,0.08)';
        nameInput.style.borderColor = 'rgba(201,168,76,0.35)';
      }
      if (priceDisplay && pendingOrderPrice) {
        priceDisplay.textContent = `Price: ₹${pendingOrderPrice}`;
        priceDisplay.style.display = 'block';
      }
      
      // Force mobile scroll to snap to the order form AFTER layout stabilizes
      const orderForm = document.getElementById('order-form');
      if (orderForm) {
        orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Visual gold highlight 
        const formEl = document.getElementById('cake-order-form');
        if (formEl) {
          formEl.style.transition = 'box-shadow 0.4s ease';
          formEl.style.boxShadow = '0 0 0 4px rgba(201,168,76,0.4)';
          setTimeout(() => { formEl.style.boxShadow = ''; }, 2000);
        }
      }
      
      sessionStorage.removeItem('pendingOrderName');
      sessionStorage.removeItem('pendingOrderPrice');
    }
  }, 1200);
});
