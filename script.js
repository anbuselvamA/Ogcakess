document.addEventListener('DOMContentLoaded', () => {

    /* --- Custom Cursor --- */
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Add hover flair on interactive elements
        const iterables = document.querySelectorAll('a, button, .product-card, .cake-crop img');
        iterables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    /* --- Parallax Hero Logic --- */
    const parallaxHero = document.querySelector('.parallax-container');
    if (parallaxHero) {
        document.addEventListener('mousemove', (e) => {
            const elements = document.querySelectorAll('.parallax-element');
            // Calculate mouse position relative to center of screen
            let x = (e.clientX - window.innerWidth / 2);
            let y = (e.clientY - window.innerHeight / 2);

            elements.forEach((el) => {
                let speed = el.getAttribute('data-speed') || 0.05;
                // Move element in opposite direction of mouse
                el.style.transform = `translateX(${-x * speed}px) translateY(${-y * speed}px)`;
            });
        });
    }    /* --- Swiper Initialization --- */
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

    /* --- Featured Slider with Dynamic Pepsi-style Background --- */
    const newCreationsSection = document.querySelector('.new-creations');

    var newCakeSwiper = new Swiper(".newCakeSwiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      loop: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      coverflowEffect: {
        rotate: 0,
        stretch: 80,
        depth: 250,
        modifier: 1,
        slideShadows: false,
      },
      speed: 800, 
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      on: {
        slideChange: function () {
            if (!newCreationsSection) return;
            const activeSlide = this.slides[this.activeIndex];
            if (activeSlide) {
                const theme = activeSlide.getAttribute('data-theme');
                newCreationsSection.classList.remove('theme-rose', 'theme-choco', 'theme-vanilla', 'theme-lavender', 'theme-peach');
                if (theme) {
                    newCreationsSection.classList.add(theme);
                }
            }
        }
      }
    });

    /* --- Premium Product Filter & Dynamic Background --- */
    const filterTabs = document.querySelectorAll('.filter-tab');
    const productCards = document.querySelectorAll('.product-card');
    const productsSection = document.getElementById('products');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked
            tab.classList.add('active');
            
            // Handle Dynamic Background transition 
            const newBgClass = tab.getAttribute('data-bg');
            if (productsSection && newBgClass) {
                // Clear existing bg classes
                productsSection.classList.remove('bg-luxury', 'bg-custom', 'bg-chocolate', 'bg-wedding');
                // Apply new bg class smoothly
                productsSection.classList.add(newBgClass);
            }

            const filterValue = tab.getAttribute('data-filter');
            
            // Handle fade/slide filtering
            productCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    card.style.animation = 'none';
                    card.offsetHeight; // trigger reflow
                    card.style.animation = 'fadeIn 0.5s ease forwards';
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

    /* --- 3D Hover Tilt Effect --- */
    const tiltEl = document.querySelector('.tilt-effect');
    if (tiltEl) {
        document.addEventListener('mousemove', (e) => {
            const rect = tiltEl.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            if(Math.abs(x) < rect.width && Math.abs(y) < rect.height) {
                tiltEl.style.transform = `perspective(1000px) rotateX(${-y / 15}deg) rotateY(${x / 15}deg) scale3d(1.05, 1.05, 1.05)`;
            } else {
                tiltEl.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            }
        });
    }
});
