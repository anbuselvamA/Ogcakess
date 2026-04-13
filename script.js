document.addEventListener('DOMContentLoaded', () => {

    /* --- Swiper Initialization --- */
    /* Updated for true horizontal 'swipe one by one gliding on same pedestal' */
    var swiper = new Swiper(".cakeSwiper", {
      effect: "slide", /* standard horizontal glide */
      grabCursor: true,
      slidesPerView: 1,
      spaceBetween: 100, /* smooth panning spacing */
      loop: true,
      speed: 800, /* smooth transition time */
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      }
    });

    /* --- Featured 3D Coverflow Swiper --- */
    var newCakeSwiper = new Swiper(".newCakeSwiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      loop: true,
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 250,
        modifier: 2,
        slideShadows: false, /* Turn off native shadow to keep background clean */
      },
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      }
    });

    /* --- Product Filter --- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            productCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    card.style.animation = 'none';
                    card.offsetHeight; /* trigger reflow */
                    card.style.animation = null; 
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* --- Word-by-Word Sequential Reveal --- */
    function setupWordReveal() {
        document.querySelectorAll('.reveal-text').forEach((el) => {
            const textHTML = el.innerHTML;
            let wordIndex = 0;
            // Matches <br> tags or completely non-whitespace sequences (words)
            el.innerHTML = textHTML.replace(/(<\/?br\s*\/?>)|([^\s<>]+)/gi, (match, isBr, isWord) => {
                if (isBr) return match;
                if (isWord) {
                    let wrapped = `<span class="word-reveal" style="animation-delay: ${wordIndex * 0.05}s">${isWord}</span>`;
                    wordIndex++;
                    return wrapped;
                }
                return match;
            });
        });
    }

    setupWordReveal();

    /* --- Scroll Reveal Animation --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-element, .reveal-text').forEach((el) => {
        scrollObserver.observe(el);
    });

    /* --- Smooth Scrolling for Navbar Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
            // Update active state in nav
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
        });
    });

    /* --- Order Modal Logic --- */
    const orderModal = document.getElementById('orderModal');
    const closeModalBtn = document.querySelector('.close-modal');

    if (orderModal && closeModalBtn) {
        // Open modal on Order Now click
        document.querySelectorAll('.btn-order').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                orderModal.classList.add('show');
            });
        });

        // Close modal on X click
        closeModalBtn.addEventListener('click', () => {
            orderModal.classList.remove('show');
        });

        // Close modal when clicking completely outside the content box
        window.addEventListener('click', (e) => {
            if (e.target === orderModal) {
                orderModal.classList.remove('show');
            }
        });
    }

    /* --- Parallax Effect for Hero Blob --- */
    const heroBlob = document.querySelector('.blob-bg-static');
    if (heroBlob) {
        window.addEventListener('mousemove', (e) => {
            /* Center of screen is 0. Moving right causes negative shift (opposite direction) */
            const xOffset = (window.innerWidth / 2 - e.pageX) / 50; /* Limits to ~15px shift on desktop */
            heroBlob.style.transform = `translateY(-50%) translateX(${xOffset}px)`;
        });
    }

    /* --- Mobile Navigation Toggle --- */
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
});
