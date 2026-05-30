/* ============================================
   DELANEEN DESIGN — Interactive Script
   Animations, Navigation & 3D Integration
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // CURSOR GLOW FOLLOWER
    // ============================
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        glowX += (mouseX - glowX) * 0.07;
        glowY += (mouseY - glowY) * 0.07;
        if (cursorGlow) {
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // ============================
    // NAVBAR SCROLL EFFECT
    // ============================
    const mainNav = document.getElementById('mainNav');

    function handleNavScroll() {
        if (window.scrollY > 60) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

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
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================
    // SCROLL REVEAL ANIMATIONS
    // ============================
    const animateElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    animateElements.forEach(el => observer.observe(el));

    // ============================
    // STAGGER ANIMATION - SKILLS CARDS
    // ============================
    const skillsCards = document.querySelectorAll('.skills__card');
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = Array.from(skillsCards).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 140);
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    skillsCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        skillsObserver.observe(card);
    });

    // ============================
    // STAGGER ANIMATION - WORKS ITEMS
    // ============================
    const worksItems = document.querySelectorAll('.works__item');
    const worksObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = Array.from(worksItems).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 120);
                worksObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    worksItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(40px)';
        item.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        worksObserver.observe(item);
    });

    // ============================
    // WORKS COUNTER
    // ============================
    const counterCurrent = document.querySelector('.counter-current');

    if (counterCurrent) {
        worksItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                counterCurrent.textContent = String(index + 1).padStart(2, '0');
            });
        });

        const worksSection = document.getElementById('works');
        if (worksSection) {
            worksSection.addEventListener('mouseleave', () => {
                counterCurrent.textContent = '01';
            });
        }
    }

    // ============================
    // PARALLAX ON SPLINE & BRUSH
    // ============================
    const heroSpline = document.getElementById('heroSpline');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        if (heroSpline) {
            heroSpline.style.transform = `translateY(${scrollY * 0.12}px)`;
        }
    }, { passive: true });

    // ============================
    // 3D TILT ON HERO IMAGE
    // ============================
    const heroImageWrapper = document.querySelector('.hero__image-wrapper');

    if (heroImageWrapper) {
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

    magneticButtons.forEach(btn => {
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

    function scrambleText(element) {
        const original = element.textContent;
        let iterations = 0;

        const interval = setInterval(() => {
            element.textContent = original
                .split('')
                .map((char, index) => {
                    if (index < iterations) return original[index];
                    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                })
                .join('');

            iterations += 0.5;

            if (iterations >= original.length) {
                clearInterval(interval);
                element.textContent = original;
            }
        }, 35);
    }

    // Scramble hero labels on load
    heroLabels.forEach((label, i) => {
        setTimeout(() => scrambleText(label), 800 + i * 300);
    });

    // Scramble on hover
    heroLabels.forEach(label => {
        label.addEventListener('mouseenter', () => scrambleText(label));
    });

    // ============================
    // ACTIVE NAV LINK
    // ============================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    function highlightActiveNav() {
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.style.color = '';
                    const href = link.getAttribute('href');
                    if (href === `#${id}`) {
                        link.style.color = 'var(--accent-dark)';
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveNav, { passive: true });

    // ============================
    // CASE STUDY DRAWER TOGGLE
    // ============================
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
    }

    // ============================
    // CONTACT FORM SUBMISSION (Formspree)
    // ============================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.contact__submit-btn');
            const originalHTML = submitBtn.innerHTML;
            
            const emailInput = document.getElementById('formEmail');
            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            
            // Client-side rate limiting: Max 2 submissions per email
            let submissions = {};
            try {
                submissions = JSON.parse(localStorage.getItem('formSubmissions') || '{}');
            } catch (err) {
                submissions = {};
            }
            
            const count = submissions[email] || 0;
            if (count >= 2) {
                submitBtn.innerHTML = '<span>Limit Exceeded (Max 2 per email)</span>';
                submitBtn.style.background = '#ff4444';
                submitBtn.style.color = '#ffffff';
                submitBtn.disabled = true;
                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                }, 4000);
                return;
            }

            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    // Update submissions count on successful response
                    submissions[email] = count + 1;
                    localStorage.setItem('formSubmissions', JSON.stringify(submissions));

                    submitBtn.innerHTML = '<span>✓ Sent Successfully</span>';
                    submitBtn.style.background = 'var(--accent)';
                    submitBtn.style.color = 'var(--bg-primary)';
                    contactForm.reset();
                    setTimeout(() => {
                        submitBtn.innerHTML = originalHTML;
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                        submitBtn.style.color = '';
                    }, 3000);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                submitBtn.innerHTML = '<span>Error — Try Again</span>';
                submitBtn.style.background = '#ff4444';
                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            }
        });
    }


    // ============================
    // PAGE LOAD TRANSITION
    // ============================
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    // Fade in immediately since the DOM is parsed and ready
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    console.log('⚡ Delaneen Design — Portfolio Loaded');
});
