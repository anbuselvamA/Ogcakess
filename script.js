/* ════════════════════════════════════════════════════
   DELICIA — script.js
   Vanilla JS · No dependencies beyond Swiper
   ════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. NAVBAR SCROLL ────────────────────────────── */
  const navbar = document.getElementById('navbar');

  const updateNav = () => navbar.classList.toggle('scrolled', window.scrollY > 48);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ─── 2. MOBILE NAV TOGGLE ────────────────────────── */
  const navToggle  = document.getElementById('nav-toggle');
  const navPrimary = document.getElementById('nav-primary');

  navToggle?.addEventListener('click', () => {
    const isOpen = navPrimary.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close nav on any link click
  navPrimary?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navPrimary.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ─── 3. SMOOTH SCROLL ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ─── 4. HERO HEADING LINE ANIMATION ─────────────── */
  // Stagger each .h1-line with a CSS animation delay
  document.querySelectorAll('.h1-line').forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(22px)';
    line.style.transition = `opacity 0.7s ease ${0.18 + i * 0.14}s, transform 0.7s ease ${0.18 + i * 0.14}s`;
    // Trigger after a short RAF
    requestAnimationFrame(() => requestAnimationFrame(() => {
      line.style.opacity = '1';
      line.style.transform = 'none';
    }));
  });

  /* ─── 5. SCROLL REVEAL ────────────────────────────── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.js-reveal, .js-card').forEach(el => revealObs.observe(el));

  /* ─── 6. HERO SWIPER ─────────────────────────────── */
  if (document.querySelector('.hero-swiper')) {
    new Swiper('.hero-swiper', {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      loop: true,
      speed: 900,
      autoplay: { delay: 3600, disableOnInteraction: false },
    });
  }

  /* ─── 7. FEATURED SWIPER ─────────────────────────── */
  if (document.querySelector('.featured-swiper')) {
    new Swiper('.featured-swiper', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: true,
      speed: 800,
      autoplay: { delay: 4000, disableOnInteraction: false },
      coverflowEffect: { rotate: 0, stretch: 60, depth: 200, modifier: 1, slideShadows: false },
      pagination: { el: '.featured-dots', clickable: true },
    });
  }

  /* ─── 7b. MOST LOVED SWIPER ──────────────────────── */
  if (document.querySelector('.loved-swiper')) {
    new Swiper('.loved-swiper', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: true,
      speed: 750,
      autoplay: { delay: 3800, disableOnInteraction: false },
      coverflowEffect: { rotate: 0, stretch: 48, depth: 180, modifier: 1, slideShadows: false },
      pagination: { el: '.loved-dots', clickable: true },
    });
  }

  /* ─── 8. PRODUCT FILTER ──────────────────────────── */
  const filterTabs = document.querySelectorAll('.ftab');
  const pCards     = document.querySelectorAll('.pcard');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.getAttribute('data-filter');
      let visIdx = 0;

      pCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-cat') === filter;

        if (match) {
          card.style.display = '';
          const delay = (visIdx * 0.045).toFixed(3);
          card.style.transition = 'none';
          card.style.opacity = '0';
          card.style.transform = 'translateY(22px)';
          requestAnimationFrame(() => requestAnimationFrame(() => {
            card.style.transition = `opacity 0.45s ${delay}s ease, transform 0.45s ${delay}s ease`;
            card.style.opacity = '1';
            card.style.transform = 'none';
          }));
          visIdx++;
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ─── 9. ACTIVE NAV on scroll ────────────────────── */
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.getAttribute('id');
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => sectionObs.observe(s));

  /* ─── 10. ORDER MODAL ────────────────────────────── */
  const orderModal    = document.getElementById('order-modal');
  const modalClose    = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');

  const openModal  = () => {
    orderModal?.classList.add('visible');
    orderModal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose?.focus();
  };
  const closeModal = () => {
    orderModal?.classList.remove('visible');
    orderModal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  /* Each product card "Order Now" → Scroll to Order Form & Pre-fill */
  document.querySelectorAll('.btn-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card  = btn.closest('.pcard');
      const cname = card?.querySelector('.pcard-name')?.textContent?.trim() || '';
      let price = card?.querySelector('.pcard-price')?.textContent?.trim() || '';
      price = price.replace('₹', '').trim();

      const cakeNameInput = document.getElementById('f-cakename');
      const priceDisplay = document.getElementById('f-priceDisplay');

      if (cakeNameInput) {
        cakeNameInput.value = cname;
        cakeNameInput.readOnly = true;
      }
      if (priceDisplay && price) {
        priceDisplay.textContent = `Price: ₹${price}`;
        priceDisplay.style.display = 'block';
      }

      const orderForm = document.getElementById('order-form');
      if (orderForm) {
        orderForm.style.display = 'block'; // Unhide the form contextually
        
        // Small delay to allow the browser to paint the unhidden element over its actual height
        setTimeout(() => {
          orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 10);
      }
    });
  });
  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

});

/* ═══════════════════════════════════════════════════════
   CUSTOM ORDER FORM → WhatsApp submission
═══════════════════════════════════════════════════════ */
(function () {
  const form = document.getElementById('cake-order-form');
  if (!form) return;

  /* Set minimum date to today */
  const dateInput = document.getElementById('f-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  /* Pre-fill logic using URL Parameters */
  const params = new URLSearchParams(window.location.search);
  const cakeParam = params.get('cake');
  const priceParam = params.get('price');
  
  const cakeNameInput = document.getElementById('f-cakename');
  const priceDisplay = document.getElementById('f-priceDisplay');

  if (cakeParam && cakeNameInput) {
    cakeNameInput.value = cakeParam;
    cakeNameInput.readOnly = true;
  }
  
  if (priceParam && priceDisplay) {
    priceDisplay.textContent = `Price: ₹${priceParam}`;
    priceDisplay.style.display = 'block';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const get = id => (document.getElementById(id)?.value || '').trim();

    const name    = get('f-name');
    const phone   = get('f-phone');
    const cakeName = get('f-cakename');
    const flavour = get('f-flavour');
    const size    = get('f-size');
    const date    = get('f-date');
    const message = get('f-message');
    const note    = get('f-note');

    /* Simple required-field check */
    if (!name || !phone || !cakeName || !flavour || !date) {
      showToast('Please fill in all required fields ✦', 'error');
      return;
    }

    /* Build the WhatsApp message */
    const lines = [
      '🎂 *New Cake Order — Zia Cakes*',
      '',
      `👤 *Name:* ${name}`,
      `📞 *Phone:* ${phone}`,
      `🎂 *Cake Name:* ${cakeName}`,
      `🍓 *Flavour:* ${flavour}`,
      `⚖️ *Size:* ${size || '1 kg'}`,
      `📅 *Delivery Date:* ${date}`,
    ];
    if (message) lines.push(`✍️ *Message on Cake:* "${message}"`);
    if (note)    lines.push(`📝 *Special Requests:* ${note}`);
    lines.push('', '_(Image if any will be shared separately)_');

    const waText = encodeURIComponent(lines.join('\n'));
    const waUrl  = `https://wa.me/918778077747?text=${waText}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp… 🎉 We will confirm your order shortly!');
    form.reset();
    
    // Restore readonly cake name if it was set via URL
    if (cakeParam && cakeNameInput) {
      cakeNameInput.value = cakeParam;
    }
  });

  /* ── Toast helper ── */
  function showToast(msg, type) {
    let toast = document.getElementById('zia-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'zia-toast';
      Object.assign(toast.style, {
        position:     'fixed',
        bottom:       '100px',
        left:         '50%',
        transform:    'translateX(-50%) translateY(20px)',
        background:   type === 'error' ? '#b83232' : '#25D366',
        color:        '#fff',
        padding:      '14px 28px',
        borderRadius: '100px',
        fontFamily:   'var(--sans, sans-serif)',
        fontSize:     '0.84rem',
        fontWeight:   '500',
        zIndex:       '9000',
        opacity:      '0',
        transition:   'opacity 0.3s ease, transform 0.3s ease',
        whiteSpace:   'nowrap',
        boxShadow:    '0 6px 24px rgba(0,0,0,0.2)',
        pointerEvents:'none',
      });
      document.body.appendChild(toast);
    } else {
      toast.style.background = type === 'error' ? '#b83232' : '#25D366';
    }

    toast.textContent = msg;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 4200);
  }
}());

/* ═══════════════════════════════════════════════════════
   LEAVE A REVIEW — star picker + WhatsApp submit
═══════════════════════════════════════════════════════ */
(function () {
  const row      = document.getElementById('star-pick-row');
  const hint     = document.getElementById('star-pick-hint');
  const form     = document.getElementById('leave-review-form');
  if (!row || !form) return;

  const stars    = Array.from(row.querySelectorAll('.sp-star'));
  const labels   = ['😕 Not great', '😐 It was OK', '😊 Good!', '😍 Really good!', '🤩 Outstanding!'];
  let   selected = 0;

  /* ── highlight up to index n ── */
  function paintStars(n) {
    stars.forEach((s, i) => {
      s.classList.toggle('hovered',  i < n && i >= selected);
      s.classList.toggle('selected', i < selected);
      if (n > 0) {
        s.classList.toggle('selected', i < n);
        s.classList.remove('hovered');
      }
    });
  }

  /* Hover */
  stars.forEach((s, i) => {
    s.addEventListener('mouseenter', () => {
      stars.forEach((x, j) => {
        x.classList.toggle('hovered', j <= i);
        x.classList.remove('selected');
      });
      hint.textContent = labels[i];
      hint.classList.add('active');
    });
    s.addEventListener('mouseleave', () => {
      stars.forEach((x, j) => {
        x.classList.toggle('selected', j < selected);
        x.classList.remove('hovered');
      });
      hint.textContent = selected ? labels[selected - 1] : 'Tap a star to rate';
      hint.classList.toggle('active', selected > 0);
    });

    /* Click */
    s.addEventListener('click', () => {
      selected = i + 1;
      stars.forEach((x, j) => {
        x.classList.toggle('selected', j < selected);
        x.classList.remove('hovered');
      });
      hint.textContent = labels[i];
      hint.classList.add('active');
    });

    /* Keyboard */
    s.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selected = i + 1;
        hint.textContent = labels[i];
        hint.classList.add('active');
        stars.forEach((x, j) => x.classList.toggle('selected', j < selected));
      }
    });
  });

  /* ── Form submit → WhatsApp ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name   = (document.getElementById('rv-name')?.value   || '').trim();
    const loc    = (document.getElementById('rv-location')?.value || '').trim();
    const review = (document.getElementById('rv-text')?.value    || '').trim();

    if (!name || !review) {
      showReviewToast('Please enter your name and review ✦', 'error');
      return;
    }
    if (!selected) {
      showReviewToast('Please tap a star to give a rating ⭐', 'error');
      return;
    }

    const starStr = '⭐'.repeat(selected);
    const lines = [
      '⭐ *New Review for Zia Cakes!*',
      '',
      `${starStr} (${selected}/5)`,
      `👤 *Name:* ${name}${loc ? ' — ' + loc : ''}`,
      `💬 *Review:* "${review}"`,
    ];
    const waText = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/918778077747?text=${waText}`, '_blank', 'noopener,noreferrer');

    showReviewToast('Thank you! Your review is being sent 🎉');
    form.reset();
    selected = 0;
    stars.forEach(s => { s.classList.remove('selected', 'hovered'); });
    hint.textContent = 'Tap a star to rate';
    hint.classList.remove('active');
  });

  /* ── Mini toast ── */
  function showReviewToast(msg, type) {
    const existing = document.getElementById('zia-toast');
    if (existing) {
      existing.style.background = type === 'error' ? '#b83232' : '#25D366';
      existing.textContent = msg;
      existing.style.opacity = '1';
      existing.style.transform = 'translateX(-50%) translateY(0)';
      setTimeout(() => {
        existing.style.opacity = '0';
        existing.style.transform = 'translateX(-50%) translateY(20px)';
      }, 4000);
      return;
    }
    const t = document.createElement('div');
    t.id = 'zia-toast';
    Object.assign(t.style, {
      position:'fixed', bottom:'100px', left:'50%',
      transform:'translateX(-50%) translateY(20px)',
      background: type === 'error' ? '#b83232' : '#25D366',
      color:'#fff', padding:'14px 28px', borderRadius:'100px',
      fontFamily:'var(--sans, sans-serif)', fontSize:'0.84rem', fontWeight:'500',
      zIndex:'9000', opacity:'0', whiteSpace:'nowrap',
      transition:'opacity .3s ease, transform .3s ease',
      boxShadow:'0 6px 24px rgba(0,0,0,0.2)', pointerEvents:'none',
    });
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(20px)';
    }, 4000);
  }
}());
