/* ════════════════════════════════════════════════════
   products-loader.js — Dynamically loads cakes from
   Firebase Firestore and renders them into #pgrid
   ════════════════════════════════════════════════════ */

import { db } from './firebase-config.js';
import {
  collection, query, where, orderBy, onSnapshot
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

  const imgHTML = cake.imageUrl
    ? `<img src="${cake.imageUrl}" alt="${cake.name}" loading="lazy" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">🎂</div>`;

  return `
  <article class="pcard js-card" style="--d:${delay}s" data-cat="${cake.category || 'all'}" data-id="${cake.id}">
    <div class="pcard-img">
      ${imgHTML}
      ${badgeHTML}
    </div>
    <div class="pcard-body">
      <h3 class="pcard-name">${cake.name}</h3>
      ${cake.description ? `<p class="pcard-desc">${cake.description}</p>` : ''}
      <div class="pcard-rating">⭐ ${rating} <span style="color:rgba(44,26,14,0.35);font-weight:400">(${reviews})</span></div>
      <div class="pcard-delivery">🟢 Same day delivery</div>
      <div class="pcard-foot">
        <div>
          <span class="pcard-price">&#8377;${price}</span>
          ${oldPriceHTML}
        </div>
        <button class="btn-order">Order</button>
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

  /* Re-attach the Order button auto-fill behavior */
  pgrid.querySelectorAll('.btn-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card  = btn.closest('.pcard');
      const cname = card?.querySelector('.pcard-name')?.textContent?.trim() || '';
      let price   = card?.querySelector('.pcard-price')?.textContent?.trim() || '';
      price = price.replace('₹', '').replace(/,/g, '').trim();

      /* Highlight selected card */
      document.querySelectorAll('.pcard').forEach(c => c.classList.remove('pcard--selected'));
      card?.classList.add('pcard--selected');

      /* Auto-fill form */
      const cakeNameInput = document.getElementById('f-cakename');
      const priceDisplay  = document.getElementById('f-priceDisplay');
      if (cakeNameInput) {
        cakeNameInput.value      = cname;
        cakeNameInput.readOnly   = true;
        cakeNameInput.style.background   = 'rgba(201,168,76,0.08)';
        cakeNameInput.style.borderColor  = 'rgba(201,168,76,0.35)';
      }
      if (priceDisplay && price) {
        priceDisplay.textContent = `Price: ₹${Number(price).toLocaleString('en-IN')}`;
        priceDisplay.style.display = 'block';
      }

      /* Scroll to order form */
      const orderForm = document.getElementById('order-form');
      if (orderForm) {
        setTimeout(() => {
          orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const formEl = document.getElementById('cake-order-form');
          if (formEl) {
            formEl.style.transition = 'box-shadow 0.3s ease';
            formEl.style.boxShadow  = '0 0 0 3px rgba(201,168,76,0.35)';
            setTimeout(() => { formEl.style.boxShadow = ''; }, 1200);
          }
        }, 10);
      }
    });
  });

  /* Re-trigger JS reveal animations if available */
  if (typeof window.initReveal === 'function') window.initReveal();

  /* Re-attach filter tabs */
  const activeCat = document.querySelector('.ftab.active')?.dataset?.filter || 'all';
  if (activeCat !== 'all') filterCards(activeCat);
}

function filterCards(cat) {
  document.querySelectorAll('.pcard').forEach(card => {
    const match = cat === 'all' || card.dataset.cat === cat;
    card.style.display = match ? '' : 'none';
  });
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
    filterCards(tab.dataset.filter);
  });
});

/* ──── Live listener — updates on any change ──── */
const q = query(
  collection(db, 'cakes'),
  where('visible', '==', true),
  orderBy('createdAt', 'desc')
);

onSnapshot(q, (snap) => {
  const cakes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (loading) loading.remove();
  renderCakes(cakes);
}, (err) => {
  console.error('products-loader:', err);
  if (loading) loading.remove();
  pgrid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:40px;color:#c00;">
      <p>⚠️ Could not load products. Please check the Firebase setup in <strong>firebase-config.js</strong>.</p>
    </div>`;
});
