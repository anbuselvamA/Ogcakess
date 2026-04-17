/* ════════════════════════════════════════════════════
   admin.js — Zia Cakes Admin Panel Logic
   ════════════════════════════════════════════════════ */

import { db } from './firebase-config.js';
import {
  collection, addDoc, getDocs, doc,
  updateDoc, deleteDoc, query, orderBy, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/* ──────────────────────────────────
   CONSTANTS
────────────────────────────────── */
const ADMIN_PASSWORD = 'ziacakes2024'; // ✏️ Change this to your own password!

/* ──────────────────────────────────
   DOM REFS
────────────────────────────────── */
const loginScreen   = document.getElementById('login-screen');
const adminApp      = document.getElementById('admin-app');
const loginForm     = document.getElementById('login-form');
const adminPassEl   = document.getElementById('admin-pass');
const loginError    = document.getElementById('login-error');
const logoutBtn     = document.getElementById('logout-btn');

const snavBtns      = document.querySelectorAll('.snav-btn[data-view]');
const viewDashboard = document.getElementById('view-dashboard');
const viewAddCake   = document.getElementById('view-add-cake');
const pageTitle     = document.getElementById('page-title');

const btnAddTop     = document.getElementById('btn-add-top');
const cakesGrid     = document.getElementById('cakes-grid');
const searchInput   = document.getElementById('search-cakes');

const cakeForm      = document.getElementById('cake-form');
const editIdInput   = document.getElementById('edit-id');
const imgUploadArea = document.getElementById('img-upload-area');
const imgFileInput  = document.getElementById('cake-image');
const imgPreview    = document.getElementById('img-preview');
const imgPlaceholder= document.getElementById('img-placeholder');
const imgError      = document.getElementById('img-error');
const cakeNameInp   = document.getElementById('cake-name');
const cakePriceInp  = document.getElementById('cake-price');
const cakeOldPrice  = document.getElementById('cake-old-price');
const cakeCatInp    = document.getElementById('cake-cat');
const cakeBadgeInp  = document.getElementById('cake-badge');
const cakeRatingInp = document.getElementById('cake-rating');
const cakeDescInp   = document.getElementById('cake-desc');
const cakeVisibleInp= document.getElementById('cake-visible');
const btnCancel     = document.getElementById('btn-cancel');
const btnSave       = document.getElementById('btn-save');
const saveLabel     = document.getElementById('save-label');
const formHeading   = document.getElementById('form-heading');
const progressWrap  = document.getElementById('upload-progress-wrap');
const progressBar   = document.getElementById('upload-progress-bar');
const progressLabel = document.getElementById('upload-progress-label');

const deleteModal   = document.getElementById('delete-modal');
const deleteModalNm = document.getElementById('delete-modal-name');
const deleteConfirm = document.getElementById('delete-confirm');
const deleteCancel  = document.getElementById('delete-cancel');
const toast         = document.getElementById('admin-toast');

const statTotal   = document.getElementById('stat-total');
const statVisible = document.getElementById('stat-visible');
const statHidden  = document.getElementById('stat-hidden');

/* ──────────────────────────────────
   STATE
────────────────────────────────── */
let allCakes     = [];         // full list from Firestore
let editingId    = null;       // cake id currently being edited
let newImageFile = null;       // file selected for upload
let pendingDelete= null;       // { id, imageUrl } for confirm delete
let unsubscribe  = null;       // Firestore real-time listener

/* ──────────────────────────────────
   LOGIN
────────────────────────────────── */
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (adminPassEl.value === ADMIN_PASSWORD) {
    loginScreen.hidden  = true;
    adminApp.hidden     = false;
    loginError.hidden   = true;
    sessionStorage.setItem('zia-admin', '1');
    startListening();
  } else {
    loginError.hidden = false;
    adminPassEl.value = '';
    adminPassEl.focus();
  }
});

// Persist session across page refresh
if (sessionStorage.getItem('zia-admin')) {
  loginScreen.hidden = true;
  adminApp.hidden    = false;
  startListening();
}

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('zia-admin');
  if (unsubscribe) unsubscribe();
  loginScreen.hidden = false;
  adminApp.hidden    = true;
});

/* ──────────────────────────────────
   NAVIGATION
────────────────────────────────── */
snavBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    snavBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showView(view);
  });
});

btnAddTop.addEventListener('click', () => {
  showView('add-cake');
  snavBtns.forEach(b => b.classList.toggle('active', b.dataset.view === 'add-cake'));
  resetForm();
});

btnCancel.addEventListener('click', () => {
  showView('dashboard');
  snavBtns.forEach(b => b.classList.toggle('active', b.dataset.view === 'dashboard'));
});

function showView(name) {
  const views = { 'dashboard': viewDashboard, 'add-cake': viewAddCake };
  const titles = { 'dashboard': 'Dashboard', 'add-cake': editingId ? 'Edit Cake' : 'Add New Cake' };
  Object.values(views).forEach(v => { v.hidden = true; v.classList.remove('active'); });
  if (views[name]) { views[name].hidden = false; views[name].classList.add('active'); }
  pageTitle.textContent = titles[name] || 'Dashboard';
}

/* ──────────────────────────────────
   REAL-TIME LISTENER
────────────────────────────────── */
function startListening() {
  const q = query(collection(db, 'cakes'), orderBy('createdAt', 'desc'));
  unsubscribe = onSnapshot(q, (snap) => {
    allCakes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderDashboard(allCakes);
    updateStats(allCakes);
  }, (err) => {
    console.error('Firestore error:', err);
    showToast('Could not load cakes. Check Firebase setup.', 'error');
  });
}

/* ──────────────────────────────────
   DASHBOARD RENDER
────────────────────────────────── */
function renderDashboard(cakes) {
  if (!cakes.length) {
    cakesGrid.innerHTML = `
      <div class="empty-state">
        <span>🎂</span>
        <p>No cakes yet. Click "+ Add New Cake" to get started!</p>
      </div>`;
    return;
  }

  cakesGrid.innerHTML = cakes.map(cake => {
    const badgeMap = { hot: '🔥', pop: '⭐', kids: '🎂' };
    const badgeIcon = badgeMap[cake.badge] || '';
    return `
    <div class="admin-cake-card" data-id="${cake.id}">
      ${cake.imageUrl
        ? `<img class="acc-img" src="${cake.imageUrl}" alt="${cake.name}" loading="lazy" />`
        : `<div class="acc-img-placeholder">🎂</div>`}
      <div class="acc-body">
        <p class="acc-name">${cake.name}</p>
        <div class="acc-meta">
          <span class="acc-price">₹${Number(cake.price).toLocaleString('en-IN')}</span>
          <span class="acc-cat">${cake.category || '—'}</span>
        </div>
        <span class="acc-status ${cake.visible !== false ? 'visible' : 'hidden'}">
          ${cake.visible !== false ? '● Live' : '● Hidden'}
        </span>
        <div class="acc-actions">
          <button class="btn-edit" onclick="adminEditCake('${cake.id}')">✏️ Edit</button>
          <button class="btn-delete" onclick="adminDeleteCake('${cake.id}', '${cake.name}', '${cake.imageUrl || ''}')">🗑️ Del</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function updateStats(cakes) {
  statTotal.textContent   = cakes.length;
  statVisible.textContent = cakes.filter(c => c.visible !== false).length;
  statHidden.textContent  = cakes.filter(c => c.visible === false).length;
}

/* Search */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  const filtered = allCakes.filter(c => c.name.toLowerCase().includes(q));
  renderDashboard(filtered);
});

/* ──────────────────────────────────
   IMAGE UPLOAD
────────────────────────────────── */
imgUploadArea.addEventListener('click', () => imgFileInput.click());

imgUploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  imgUploadArea.style.borderColor = 'var(--gold)';
});
imgUploadArea.addEventListener('dragleave', () => {
  imgUploadArea.style.borderColor = '';
});
imgUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  imgUploadArea.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleImageFile(file);
});

imgFileInput.addEventListener('change', () => {
  if (imgFileInput.files[0]) handleImageFile(imgFileInput.files[0]);
});

function handleImageFile(file) {
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image too large. Max 5MB.', 'error'); return;
  }
  newImageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imgPreview.src     = e.target.result;
    imgPreview.hidden  = false;
    imgPlaceholder.hidden = true;
    imgError.hidden    = true;
  };
  reader.readAsDataURL(file);
}

/* ──────────────────────────────────
   SAVE FORM (Add or Edit)
────────────────────────────────── */
cakeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  btnSave.disabled    = true;
  saveLabel.textContent = '⏳ Saving...';

  try {
    let imageUrl = imgPreview.src && !imgPreview.hidden && !imgPreview.src.startsWith('data')
      ? imgPreview.src   // Existing URL (editing without new image)
      : null;

    // Upload new image if selected
    if (newImageFile) {
      imageUrl = await uploadImage(newImageFile);
    }

    const data = {
      name:      cakeNameInp.value.trim(),
      price:     parseFloat(cakePriceInp.value),
      oldPrice:  cakeOldPrice.value ? parseFloat(cakeOldPrice.value) : null,
      category:  cakeCatInp.value,
      badge:     cakeBadgeInp.value || null,
      rating:    cakeRatingInp.value ? parseFloat(cakeRatingInp.value) : 4.5,
      description: cakeDescInp.value.trim(),
      visible:   cakeVisibleInp.checked,
      imageUrl:  imageUrl || null,
    };

    if (editingId) {
      await updateDoc(doc(db, 'cakes', editingId), data);
      showToast('🎂 Cake updated successfully!', 'success');
    } else {
      data.createdAt = new Date();
      await addDoc(collection(db, 'cakes'), data);
      showToast('🎉 New cake added to the website!', 'success');
    }

    resetForm();
    showView('dashboard');
    snavBtns.forEach(b => b.classList.toggle('active', b.dataset.view === 'dashboard'));

  } catch (err) {
    console.error(err);
    showToast('Error saving cake: ' + err.message, 'error');
  } finally {
    btnSave.disabled    = false;
    saveLabel.textContent = '💾 Save & Publish';
    progressWrap.hidden = true;
  }
});

/* Upload image to Firebase Storage — with timeout & error fallback */
function uploadImage(file) {
  return compressAndEncode(file);
}

/* Compress image client-side and return a base64 data URL */
function compressAndEncode(file) {
  return new Promise((resolve) => {
    progressWrap.hidden = false;
    progressLabel.textContent = 'Processing image...';
    progressBar.style.width = '30%';

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 800px width/height
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else       { w = Math.round(w * MAX / h); h = MAX; }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        progressBar.style.width = '70%';
        progressLabel.textContent = 'Compressing...';

        // Compress to JPEG at 75% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);

        progressBar.style.width = '100%';
        progressLabel.textContent = '✅ Image ready!';

        resolve(dataUrl);
      };
      img.onerror = () => {
        progressLabel.textContent = '⚠️ Could not process image';
        resolve(null);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/* Validation */
function validate() {
  let ok = true;
  if (!cakeNameInp.value.trim()) { ok = false; cakeNameInp.style.borderColor = 'red'; }
  else cakeNameInp.style.borderColor = '';
  if (!cakePriceInp.value || cakePriceInp.value <= 0) { ok = false; cakePriceInp.style.borderColor = 'red'; }
  else cakePriceInp.style.borderColor = '';
  if (!cakeCatInp.value) { ok = false; cakeCatInp.style.borderColor = 'red'; }
  else cakeCatInp.style.borderColor = '';

  if (!ok) showToast('Please fill in all required fields.', 'error');
  return ok;
}

/* ──────────────────────────────────
   EDIT
────────────────────────────────── */
window.adminEditCake = (id) => {
  const cake = allCakes.find(c => c.id === id);
  if (!cake) return;

  editingId = id;
  formHeading.textContent = 'Edit Cake';

  cakeNameInp.value   = cake.name || '';
  cakePriceInp.value  = cake.price || '';
  cakeOldPrice.value  = cake.oldPrice || '';
  cakeCatInp.value    = cake.category || '';
  cakeBadgeInp.value  = cake.badge || '';
  cakeRatingInp.value = cake.rating || '';
  cakeDescInp.value   = cake.description || '';
  cakeVisibleInp.checked = cake.visible !== false;

  if (cake.imageUrl) {
    imgPreview.src      = cake.imageUrl;
    imgPreview.hidden   = false;
    imgPlaceholder.hidden = true;
  } else {
    imgPreview.hidden   = true;
    imgPlaceholder.hidden = false;
  }
  newImageFile = null;

  showView('add-cake');
  snavBtns.forEach(b => b.classList.toggle('active', b.dataset.view === 'add-cake'));
  document.querySelector('.form-wrap')?.scrollIntoView({ behavior: 'smooth' });
};

/* ──────────────────────────────────
   DELETE
────────────────────────────────── */
window.adminDeleteCake = (id, name, imageUrl) => {
  pendingDelete = { id, imageUrl };
  deleteModalNm.textContent = `"${name}" will be permanently deleted.`;
  deleteModal.hidden = false;
};

deleteCancel.addEventListener('click', () => {
  deleteModal.hidden = true;
  pendingDelete = null;
});

deleteConfirm.addEventListener('click', async () => {
  if (!pendingDelete) return;
  deleteConfirm.textContent = 'Deleting...';
  try {
    await deleteDoc(doc(db, 'cakes', pendingDelete.id));
    showToast('Cake deleted.', 'success');
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    deleteModal.hidden = true;
    pendingDelete = null;
    deleteConfirm.textContent = 'Yes, Delete';
  }
});

/* ──────────────────────────────────
   RESET FORM
────────────────────────────────── */
function resetForm() {
  editingId = null;
  newImageFile = null;
  cakeForm.reset();
  imgPreview.hidden     = true;
  imgPlaceholder.hidden = false;
  imgPreview.src        = '';
  progressWrap.hidden   = true;
  progressBar.style.width = '0%';
  formHeading.textContent = 'Add New Cake';
  imgError.hidden = true;
  // Reset border colors
  [cakeNameInp, cakePriceInp, cakeCatInp].forEach(el => el.style.borderColor = '');
}

/* ──────────────────────────────────
   TOAST
────────────────────────────────── */
let toastTimer;
function showToast(msg, type = 'success') {
  toast.textContent  = msg;
  toast.className    = `admin-toast ${type}`;
  toast.hidden       = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}
