/* ============================================
   DELANEEN DESIGN — Interactive Script
   Animations, Navigation & 3D Integration
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. DYNAMIC TEXT CYCLING (HERO SLOT MACHINE)
    // ============================================
    function initHeroSlotMachine() {
 if (matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return;
        const slotWindow = document.getElementById('heroSlotWindow');
        if (!slotWindow) return;
        const words = slotWindow.querySelectorAll('.cycler-word');
        if (words.length < 2) return;

        let currentIndex = 0;
        let isPaused = false;

        function cycleNext() {
            if (isPaused || document.hidden) return;
            const currentWord = words[currentIndex];
            currentIndex = (currentIndex + 1) % words.length;
            const nextWord = words[currentIndex];

            currentWord.classList.remove('is-active');
            currentWord.classList.add('is-exiting');

            nextWord.classList.remove('is-exiting');
            nextWord.classList.add('is-active');

            setTimeout(() => {
                currentWord.classList.remove('is-exiting');
            }, 650);
        }

        let cycleTimer = setInterval(cycleNext, 2500);

        const cyclerPill = slotWindow.closest('.hero__cycler-pill');
        if (cyclerPill) {
            cyclerPill.addEventListener('mouseenter', () => { isPaused = true; });
            cyclerPill.addEventListener('mouseleave', () => { isPaused = false; });
            cyclerPill.addEventListener('click', () => {
                clearInterval(cycleTimer);
                cycleNext();
                cycleTimer = setInterval(cycleNext, 2500);
            });
        }
    }
    initHeroSlotMachine();

    // Theme preferences and controls are owned by theme.js on every page.

    // ============================================
    // 3. INTERACTIVE SCROLL & CURVED PATH TRACER
    // ============================================
    function initScrollPathTracer() {
        const tracerSvg = document.getElementById('scrollTracerSvg');
        const tracerPath = document.getElementById('tracerLine');
        const bgPath = document.getElementById('tracerLineBg');
        const beacon = document.getElementById('tracerBeacon');
        if (!tracerSvg || !tracerPath) return;

        let totalLength = 0;

        function buildCurvedPath() {
            const docHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
            const winWidth = window.innerWidth;
            tracerSvg.setAttribute('viewBox', `0 0 ${winWidth} ${docHeight}`);

            // Waypoints matching layout sections
            const startX = winWidth * 0.5, startY = 240;
            const w1X = winWidth * 0.82, w1Y = Math.min(docHeight * 0.22, 1100);
            const w2X = winWidth * 0.18, w2Y = Math.min(docHeight * 0.44, 2100);
            const w3X = winWidth * 0.80, w3Y = Math.min(docHeight * 0.68, 3300);
            const endX = winWidth * 0.5, endY = docHeight - 160;

            const pathD = `M ${startX},${startY} ` +
                          `C ${w1X},${startY + 260} ${w1X},${w1Y - 260} ${w1X},${w1Y} ` +
                          `C ${w1X},${w1Y + 300} ${w2X},${w2Y - 300} ${w2X},${w2Y} ` +
                          `C ${w2X},${w2Y + 300} ${w3X},${w3Y - 300} ${w3X},${w3Y} ` +
                          `C ${w3X},${w3Y + 300} ${endX},${endY - 300} ${endX},${endY}`;

            tracerPath.setAttribute('d', pathD);
            if (bgPath) bgPath.setAttribute('d', pathD);

            try {
                totalLength = tracerPath.getTotalLength();
                tracerPath.style.strokeDasharray = `${totalLength}`;
                tracerPath.style.strokeDashoffset = `${totalLength}`;
            } catch (e) {}
        }

        buildCurvedPath();
        window.addEventListener('resize', buildCurvedPath);

        function updateTraceProgress() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollMax = (document.documentElement.scrollHeight - window.innerHeight) || 1;
            const progress = Math.min(Math.max(scrollTop / scrollMax, 0), 1);

            if (totalLength > 0) {
                tracerPath.style.strokeDashoffset = totalLength * (1 - progress);
                if (beacon) {
                    try {
                        const pt = tracerPath.getPointAtLength(totalLength * progress);
                        beacon.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
                        beacon.style.opacity = progress > 0.02 && progress < 0.98 ? '1' : '0.4';
                    } catch (e) {}
                }
            }
        }

        window.addEventListener('scroll', updateTraceProgress, { passive: true });
        updateTraceProgress();
    }
    initScrollPathTracer();

    // ============================================
    // SMOOTH PARALLAX SCROLL
    // ============================================
    function initParallax() {
 if (matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return;
        const parallaxEls = document.querySelectorAll('[data-parallax]');
        if (!parallaxEls.length) return;

        let ticking = false;
        function renderParallax() {
            const winH = window.innerHeight;
            parallaxEls.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.05;
                const rect = el.getBoundingClientRect();
                if (rect.top < winH && rect.bottom > 0) {
                    const offset = (winH / 2 - (rect.top + rect.height / 2)) * speed;
                    el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
                }
            });
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(renderParallax);
                ticking = true;
            }
        }, { passive: true });
    }
    initParallax();

    // ============================================
    // 4. FLOATING CURSOR & MAGNETIC DRAG
    // ============================================
    function initMagneticCursor() {
 if (matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return;
        const cursorGlow = document.getElementById('cursorGlow');
        const cursorBadge = document.getElementById('cursorBadge');
        const cursorBadgeText = document.getElementById('cursorBadgeText');
        const cursorDot = document.getElementById('cursorDot');

        if (!cursorGlow && !cursorBadge && !cursorDot) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        let glowX = mouseX, glowY = mouseY;
        let badgeX = mouseX, badgeY = mouseY;
        let dotX = mouseX, dotY = mouseY;

        let targetBadgeX = mouseX, targetBadgeY = mouseY;
        let isMagnetic = false;
        let cursorFrame = 0;
        function requestCursor() {
            if (!cursorFrame && !document.hidden) cursorFrame = requestAnimationFrame(animateCursor);
        }

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isMagnetic) {
                targetBadgeX = mouseX + 16;
                targetBadgeY = mouseY + 16;
            }
            requestCursor();
        });

        // Magnetic element definitions
        const magneticConfigs = [
            { selector: '.works__item', label: 'VIEW CASE', magnetic: true },
            { selector: '.nav__cta', label: 'CONNECT', magnetic: true },
            { selector: '.theme-toggle', label: 'THEME', magnetic: true },
            { selector: '.hero__cycler-pill', label: 'SPIN', magnetic: false },
            { selector: '.hero__explore', label: 'TOUR', magnetic: true }
        ];

        magneticConfigs.forEach(({ selector, label, magnetic }) => {
            document.querySelectorAll(selector).forEach(el => {
                el.addEventListener('mouseenter', () => {
                    if (cursorBadgeText) cursorBadgeText.textContent = label;
                    if (cursorBadge) cursorBadge.classList.add('is-visible');
                    if (magnetic) {
                        isMagnetic = true;
                        const rect = el.getBoundingClientRect();
                        targetBadgeX = rect.left + rect.width / 2;
                        targetBadgeY = rect.top + rect.height / 2;
                    }
                    requestCursor();
                });

                if (magnetic) {
                    el.addEventListener('mousemove', (e) => {
                        const rect = el.getBoundingClientRect();
                        const cx = rect.left + rect.width / 2;
                        const cy = rect.top + rect.height / 2;
                        targetBadgeX = cx + (e.clientX - cx) * 0.35;
                        targetBadgeY = cy + (e.clientY - cy) * 0.35;
                        requestCursor();
                    });
                }

                el.addEventListener('mouseleave', () => {
                    isMagnetic = false;
                    if (cursorBadge) cursorBadge.classList.remove('is-visible');
                    targetBadgeX = mouseX + 16; targetBadgeY = mouseY + 16;
                    requestCursor();
                });
            });
        });

        function animateCursor() {
            cursorFrame = 0;
            if (document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;

            badgeX += (targetBadgeX - badgeX) * (isMagnetic ? 0.22 : 0.14);
            badgeY += (targetBadgeY - badgeY) * (isMagnetic ? 0.22 : 0.14);

            dotX += (mouseX - dotX) * 0.35;
            dotY += (mouseY - dotY) * 0.35;

            if (cursorGlow) {
                cursorGlow.style.left = `${glowX}px`;
                cursorGlow.style.top = `${glowY}px`;
            }
            if (cursorBadge) {
                cursorBadge.style.left = `${badgeX}px`;
                cursorBadge.style.top = `${badgeY}px`;
            }
            if (cursorDot) {
                cursorDot.style.left = `${dotX}px`;
                cursorDot.style.top = `${dotY}px`;
            }

            const unsettled = Math.abs(mouseX - glowX) + Math.abs(mouseY - glowY)
                + Math.abs(targetBadgeX - badgeX) + Math.abs(targetBadgeY - badgeY)
                + Math.abs(mouseX - dotX) + Math.abs(mouseY - dotY) > 0.5;
            if (unsettled) requestCursor();
        }
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { cancelAnimationFrame(cursorFrame); cursorFrame = 0; }
            else requestCursor();
        });
        requestCursor();
    }
    initMagneticCursor();

    // ============================================
    // 5. RESPONSIVE INTERACTIVE FOOTER GRAPHIC
    // ============================================
    function initInteractiveGarden() {
        const stage = document.getElementById('landscapeStage');
        const floraSvg = document.getElementById('landscapeFlora');
        if (!stage || !floraSvg) return;

        const specimens = floraSvg.querySelectorAll('.flora-specimen');

        stage.addEventListener('mousemove', (e) => {
            const rect = stage.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * 1440;
            const relY = ((e.clientY - rect.top) / rect.height) * 280;

            specimens.forEach(specimen => {
                const origin = specimen.getAttribute('data-origin');
                if (!origin) return;
                const [ox, oy] = origin.split(',').map(Number);
                const dx = relX - ox;
                const dy = relY - oy;
                const dist = Math.hypot(dx, dy);

                if (dist < 220) {
                    const power = 1 - dist / 220;
                    const angle = (dx > 0 ? -1 : 1) * power * 15;
                    const scale = 1 + power * 0.14;
                    specimen.style.transform = `rotate(${angle.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
                } else {
                    specimen.style.transform = '';
                }
            });
        });

        stage.addEventListener('mouseleave', () => {
            specimens.forEach(s => { s.style.transform = ''; });
        });
    }
    initInteractiveGarden();

    // ============================
    // NAVBAR SCROLL EFFECT
    // ============================
    const mainNav = document.getElementById('mainNav');

    let navFrame = 0;
    function handleNavScroll() {
        navFrame = 0;
        // Read section geometry before writing header and link styles.
        highlightActiveNav();
        mainNav?.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', () => {
        if (!navFrame) navFrame = requestAnimationFrame(handleNavScroll);
    }, { passive: true });

    // ============================
    // HAMBURGER MENU
    // ============================
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ============================
    // SMOOTH SCROLL FOR HASH LINKS
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            try {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                    });
                }
            } catch (err) {}
        });
    });

    // ============================
    // SCROLL REVEAL ANIMATIONS
    // ============================
    // One observer handles reveal timing. Content stays visible without JS or
    // IntersectionObserver, and hidden project cards reveal when expanded.
    const animateElements = document.querySelectorAll('[data-animate]');
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const delay = Number.parseInt(entry.target.dataset.delay, 10) || 0;
                entry.target.style.transitionDelay = `${Math.min(600, delay)}ms`;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08 });
        animateElements.forEach(element => observer.observe(element));
        document.documentElement.classList.add('reveal-ready');
    }

    // ============================
    // 3D TILT ON HERO IMAGE
    // ============================
    const heroImageWrapper = document.querySelector('.hero__image-wrapper');

    if (heroImageWrapper && !matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) {
        heroImageWrapper.addEventListener('mousemove', (e) => {
            const rect = heroImageWrapper.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            heroImageWrapper.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
            heroImageWrapper.style.transition = 'transform 0.1s ease';
        });

        heroImageWrapper.addEventListener('mouseleave', () => {
            heroImageWrapper.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
            heroImageWrapper.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    }

    // ============================
    // MAGNETIC BUTTONS
    // ============================
    const magneticButtons = document.querySelectorAll('.nav__cta, .contact__btn, .spline-cta');

    if (!matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ============================
    // SCRAMBLE TEXT EFFECT ON LABELS
    // ============================
    const heroLabels = document.querySelectorAll('.hero__label');
    const glitchChars = '!<>-_\\/[]{}—=+*^?#';

    // Store immutable original text on each label immediately before any animation runs
    heroLabels.forEach(label => {
        if (!label.dataset.original) {
            label.dataset.original = label.getAttribute('data-original') || label.textContent.trim();
        }
    });

    function scrambleText(element) {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        // Always read from immutable dataset or data-original attribute, never from current scrambled text
        const original = element.dataset.original || element.getAttribute('data-original') || element.textContent.trim();
        element.dataset.original = original;

        // Clear any running scramble interval on this element to prevent overlapping race conditions
        if (element._scrambleTimer) {
            clearInterval(element._scrambleTimer);
            element._scrambleTimer = null;
        }

        let iterations = 0;
        const totalSteps = original.length;

        element._scrambleTimer = setInterval(() => {
            element.textContent = original
                .split('')
                .map((char, index) => {
                    // Keep whitespace intact so words don't collapse or distort
                    if (char === ' ') return ' ';
                    if (index < Math.floor(iterations)) return original[index];
                    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                })
                .join('');

            iterations += 0.5;

            // When iterations complete, stop interval and guarantee 100% full original text
            if (iterations >= totalSteps) {
                clearInterval(element._scrambleTimer);
                element._scrambleTimer = null;
                element.textContent = original;
            }
        }, 30);
    }

    // Scramble hero labels on load once
    heroLabels.forEach((label, i) => {
        setTimeout(() => scrambleText(label), 700 + i * 350);
    });

    // Scramble on hover
    heroLabels.forEach(label => {
        label.addEventListener('mouseenter', () => scrambleText(label));
        label.addEventListener('mouseleave', () => {
            // Safety timeout to ensure word is complete if cursor leaves early
            setTimeout(() => {
                if (label.dataset.original && !label._scrambleTimer) {
                    label.textContent = label.dataset.original;
                }
            }, 300);
        });
    });

    // ============================
    // ACTIVE NAV LINK
    // ============================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    let highlightedSection;
    function highlightActiveNav() {
        const scrollPos = window.scrollY + 200;
        let current = null;
        for (const section of sections) {
            const top = section.offsetTop;
            if (scrollPos >= top && scrollPos < top + section.offsetHeight) {
                current = section.id;
                break;
            }
        }
        if (current === highlightedSection) return;
        highlightedSection = current;
        navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--accent-dark)' : '';
        });
    }
    handleNavScroll();

    // ============================
    // CASE STUDY DRAWER TOGGLE
    // ============================
    const notesToggle = document.getElementById('projectNotesToggle');
    const notesGrid = document.getElementById('projectNotesGrid');
    if (notesToggle && notesGrid) notesToggle.addEventListener('click', () => {
        notesGrid.hidden = !notesGrid.hidden;
        notesToggle.setAttribute('aria-expanded', String(!notesGrid.hidden));
        notesToggle.textContent = notesGrid.hidden ? 'Explore project notes ↓' : 'Close project notes ↑';
    });

    const caseStudyOverlay = document.getElementById('caseStudyOverlay');
    const openCaseStudyBtns = document.querySelectorAll('.open-case-study');
    const closeCaseStudyBtns = document.querySelectorAll('.case-study-drawer__close');

    if (openCaseStudyBtns && caseStudyOverlay) {
        openCaseStudyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const caseId = btn.dataset.case;
                const drawer = document.getElementById(`caseStudyDrawer-${caseId}`);
                if (drawer) {
                    drawer._returnFocus = btn;
                    drawer.classList.add('active');
                    caseStudyOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        const closeAllDrawers = () => {
            document.querySelectorAll('.case-study-drawer').forEach(drawer => {
                drawer.classList.remove('active');
            });
            caseStudyOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeCaseStudyBtns.forEach(btn => {
            btn.addEventListener('click', closeAllDrawers);
        });

        caseStudyOverlay.addEventListener('click', closeAllDrawers);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && caseStudyOverlay.classList.contains('active')) closeAllDrawers();
        });
    }

    // ============================
    // CONTACT FORM SUBMISSION (Formspree)
    // ============================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!contactForm.reportValidity()) return;
        const button = contactForm.querySelector('.contact__submit-btn');
        if (button.disabled) return;
        const original = button.innerHTML;
        const status = document.getElementById('formStatus');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        button.disabled = true;
        button.textContent = 'Sending…';
        contactForm.setAttribute('aria-busy', 'true');
        status.textContent = '';
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST', body: new FormData(contactForm),
                headers: { Accept: 'application/json' }, signal: controller.signal
            });
            if (!response.ok) throw new Error('Message delivery failed');
            contactForm.reset();
            status.textContent = 'Your message is sent. Thanks for telling me about your idea!';
        } catch {
            status.textContent = 'That didn’t send. Your message is still here. Please try again, or email hosanna.ute@gmail.com.';
        } finally {
            clearTimeout(timeout);
            button.disabled = false;
            button.innerHTML = original;
            contactForm.removeAttribute('aria-busy');
        }
    });

    // ============================
    // LIGHTBOX MODAL FOR WORKS
    // ============================
    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxModal) {
        const lightboxImage = lightboxModal.querySelector('.lightbox__image');
        const lightboxCaption = lightboxModal.querySelector('.lightbox__caption');
        const lightboxClose = lightboxModal.querySelector('.lightbox__close');

        // Target all image wrappers in works items
        document.querySelectorAll('.works__item-image').forEach(imgWrapper => {
            imgWrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const img = imgWrapper.querySelector('.works__item-img-src');
                const worksItem = imgWrapper.closest('.works__item');
                const titleEl = worksItem ? worksItem.querySelector('.works__item-title') : null;
                
                if (img && lightboxImage) {
                    lightboxImage.src = img.src;
                    lightboxImage.alt = img.alt;
                    lightboxModal._returnFocus = imgWrapper;
                    if (lightboxCaption) {
                        lightboxCaption.textContent = titleEl ? titleEl.textContent : img.alt;
                    }
                    lightboxModal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Lock background scrolling
                }
            });
        });

        // Close functions
        const closeLightbox = () => {
            lightboxModal.classList.remove('active'); lightboxModal._returnFocus?.focus();
            document.body.style.overflow = ''; // Restore scrolling
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        // Close on clicking outside the image
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });

        // Close on Esc key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
                closeLightbox();
            }
        });
    }


    console.log('⚡ Delaneen Design — Portfolio Loaded');
});

document.addEventListener('DOMContentLoaded', () => {
    const designs = [
        ['20260729_124349_0001.jpg', 'Bitewell — Crispy Take'],
        ['20260729_124349_0002.jpg', 'Bitewell — Classic Treat'],
        ['20260729_124349_0003.jpg', 'Bitewell — Fresh Bite'],
        ['20260729_124350_0004.jpg', 'Bitewell — Perfect Combo'],
        ['20260806_120745_0001.jpg', 'Bokku — Fresh Bread'],
        ['20260806_120745_0002.jpg', 'Bokku — More Than Bread'],
        ['20260806_120745_0003.jpg', 'Bokku — From Our Oven'],
        ['20260806_120745_0004.jpg', 'Bokku — Bigger Smiles'],
        ['20260806_120746_0006.jpg', 'Pringles — Pop, Play, Pringles'],
        ['20260806_120746_0007.jpg', 'Pringles — Bursting With Flavour'],
        ['20260806_120746_0008.jpg', 'Pringles — Every Mood'],
        ['20260806_120746_0009.jpg', 'Pringles — Share the Crunch'],
        ['20260812_143942_0001.jpg', 'Honeybee — Pure by Nature'],
        ['20260812_143942_0002.jpg', 'Honeybee — Goodness You Can Trust'],
        ['20260812_143942_0003.jpg', 'Honeybee — From Hive to Home'],
        ['20260812_143942_0004.jpg', 'Honeybee — Sweet in Every Drop'],
        ['20260813_134613_0000.jpg', 'Bakati — Catch the Goodness'],
        ['20260806_120750_0016.jpg', 'Kivo — Start Your Day'],
        ['20260806_120750_0017.jpg', 'Kivo — Smooth and Creamy'],
        ['20260806_120750_0018.jpg', 'Kivo — Every Moment'],
        ['20260806_120750_0019.jpg', 'Kivo — More Cream, More Joy'],
        ['20260806_120750_0021.jpg', 'Tom Tom — Small Candy, Big Happiness'],
        ['20260806_120750_0022.jpg', 'Tom Tom — The Taste You Grew Up With'],
        ['20260806_120750_0023.jpg', 'Tom Tom — On the Go'],
        ['20260806_120750_0024.jpg', 'Tom Tom — Fresh Breath'],
        ['20260806_120750_0026.jpg', 'Domino’s — Pizza Perfection'],
        ['20260806_120750_0027.jpg', 'Domino’s — More Than Pizza'],
        ['20260806_120751_0028.jpg', 'Domino’s — Feast Together'],
        ['20260806_120751_0029.jpg', 'Domino’s — Every Bite'],
        ['30fc5fb95a35a3a9ed578a6e13bc5798e74295680f425596697723f98014eb3e.png', 'Zara’s — Pop, Crunch, Repeat'],
        ['53e69cd1ad1a3d15ef7fa1441dd07ef026b508623382643411d098c4ca456764.png', 'Nina’s — Crunchy Little Joy Bites']
    ];
    const rail = document.getElementById('worksOrbitRing');
    if (!rail) return;
    const prev = document.getElementById('worksOrbitPrev');
    const next = document.getElementById('worksOrbitNext');
    const title = document.getElementById('worksOrbitTitle');
    let active = 0, target = 0, frame, timer, drag, moved = false;
    rail.tabIndex = 0;
    rail.setAttribute('role', 'region');
    rail.setAttribute('aria-label', 'Design gallery');
    rail.setAttribute('aria-describedby', 'worksOrbitHint');
    const cards = designs.map(([file, label], i) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'works-orbit__card';
        card.setAttribute('aria-label', `View ${label}, ${i + 1} of ${designs.length}`);
        const img = new Image();
        const fullSrc = `images/My%20Designs/${encodeURIComponent(file)}`;
        img.src = `images/gallery-previews/${encodeURIComponent(file.replace(/\.[^.]+$/, '.webp'))}`;
        img.alt = label;
        img.loading = i < 3 ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.draggable = false;
        card.append(img);
        card.addEventListener('click', () => {
            if (moved) return;
            const modal = document.getElementById('lightboxModal');
            if (!modal) return;
            modal.querySelector('img').src = fullSrc;
            modal.querySelector('img').alt = label;
            modal.querySelector('.lightbox__caption').textContent = `${label} · Design exploration`;
            modal.classList.add('active');
            modal._returnFocus = card;
            document.body.style.overflow = 'hidden';
            modal.querySelector('button').focus();
        });
        rail.append(card);
        return card;
    });
    function update() {
        frame = null;
        const center = rail.scrollLeft + rail.clientWidth / 2;
        const distance = card => Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        active = cards.reduce((best, card, i) => distance(card) < distance(cards[best]) ? i : best, 0);
        cards.forEach((card, i) => card.classList.toggle('is-active', i === active));
        title.textContent = `${designs[active][1]} · ${String(active + 1).padStart(2, '0')} / ${cards.length}`;
        const current = document.querySelector('.counter-current');
        const total = document.querySelector('.counter-total');
        if (current) current.textContent = String(active + 1).padStart(2, '0');
        if (total) total.textContent = String(cards.length).padStart(2, '0');
        cards.forEach((card, index) => { card.tabIndex = index === active ? 0 : -1; });
        prev.disabled = active === 0;
        next.disabled = active === cards.length - 1;
    }
    function go(index, instant = false) {
        target = Math.max(0, Math.min(index, cards.length - 1));
        const card = cards[target];
        rail.scrollTo({left: card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2,
            behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
    prev.addEventListener('click', () => go(target - 1));
    next.addEventListener('click', () => go(target + 1));
    rail.addEventListener('scroll', () => {
        if (!frame) frame = requestAnimationFrame(update);
        clearTimeout(timer);
        timer = setTimeout(() => { target = active; }, 180);
    }, {passive: true});
    rail.addEventListener('keydown', e => {
        const keys = {ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: cards.length - 1};
        if (e.key in keys) {
            e.preventDefault(); go(keys[e.key]);
            cards.forEach((card, index) => { card.tabIndex = index === target ? 0 : -1; });
            cards[target].focus({ preventScroll: true });
        }
    });
    rail.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        drag = {x: e.clientX, left: rail.scrollLeft, id: e.pointerId}; moved = false;
    });
    rail.addEventListener('pointermove', e => {
        if (!drag) return;
        const delta = e.clientX - drag.x;
        if (Math.abs(delta) > 6 && !moved) {
            moved = true; rail.setPointerCapture(e.pointerId); rail.classList.add('is-dragging');
        }
        if (moved) rail.scrollLeft = drag.left - delta;
    });
    function endDrag() {
        if (!drag) return;
        const id = drag.id; drag = null;
        if (rail.hasPointerCapture(id)) rail.releasePointerCapture(id);
        rail.classList.remove('is-dragging'); update(); target = active;
        if (moved) go(active);
        setTimeout(() => { moved = false; }, 0);
    }
    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);
    rail.addEventListener('lostpointercapture', endDrag);
    rail.addEventListener('pointerleave', () => { if (!moved) endDrag(); });
    if ('ResizeObserver' in window) new ResizeObserver(() => { go(active, true); update(); }).observe(rail);
    update();

});
