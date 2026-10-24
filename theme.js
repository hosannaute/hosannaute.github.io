(() => {
    const root = document.documentElement;
    const systemTheme = matchMedia('(prefers-color-scheme: dark)');
    function preference() {
        try {
            const value = localStorage.getItem('delaneen_theme');
            return value === 'dark' || value === 'light' ? value : null;
        } catch { return null; }
    }
    root.dataset.theme = preference() || (systemTheme.matches ? 'dark' : 'light');
    document.addEventListener('DOMContentLoaded', () => {
        // One theme owner for every page. Loading a page does not overwrite the
        // absence of a preference, so system-theme changes continue to work.
        const buttons = ['themeToggle', 'mobileThemeToggle', 'pageThemeToggle']
            .map(id => document.getElementById(id)).filter(Boolean);
        function syncTheme() {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            buttons.forEach(button => {
                button.setAttribute('aria-label', `Switch to ${next} mode`);
                button.title = `Switch to ${next} mode`;
                if (button.id === 'pageThemeToggle') button.textContent = `${next === 'light' ? 'Light' : 'Dark'} mode`;
                const text = button.querySelector('.mobile-theme-btn__text');
                const icon = button.querySelector('.mobile-theme-btn__icon');
                if (text) text.textContent = `Switch to ${next} mode`;
                if (icon) { icon.textContent = next === 'light' ? '☀' : '☾'; icon.setAttribute('aria-hidden', 'true'); }
            });
        }
        syncTheme();
        buttons.forEach(button => button.addEventListener('click', () => {
            root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem('delaneen_theme', root.dataset.theme); } catch {}
            syncTheme();
        }));
        systemTheme.addEventListener('change', event => {
            if (!preference()) { root.dataset.theme = event.matches ? 'dark' : 'light'; syncTheme(); }
        });

        const menu = document.getElementById('mobileMenu');
        const hamburger = document.getElementById('hamburger');
        if (menu && hamburger) {
            hamburger.setAttribute('aria-controls', 'mobileMenu');
            const sync = () => {
                const open = menu.classList.contains('active');
                hamburger.setAttribute('aria-expanded', String(open));
                hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
                menu.toggleAttribute('inert', !open);
                menu.setAttribute('aria-hidden', String(!open));
            };
            new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['class'] });
            sync();
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' && menu.classList.contains('active')) {
                    hamburger.click(); hamburger.focus();
                }
            });
            matchMedia('(min-width: 1025px)').addEventListener('change', event => {
                if (event.matches && menu.classList.contains('active')) hamburger.click();
            });
        }

        const modals = [...document.querySelectorAll('.lightbox, .case-study-drawer, .cart-panel')];
        const focusable = container => [...container.querySelectorAll('button, a[href], input, textarea, select, [tabindex="0"]')]
            .filter(element => !element.disabled && !element.closest('[hidden], [inert]') && element.getClientRects().length);
        const activeModal = () => modals.find(modal => modal.classList.contains('active'));
        modals.forEach(modal => {
            let wasOpen = false;
            function sync() {
                const open = modal.classList.contains('active');
                modal.toggleAttribute('inert', !open);
                modal.setAttribute('aria-hidden', String(!open));
                if (open && !wasOpen) {
                    modal._returnFocus ||= document.activeElement;
                    focusable(modal)[0]?.focus({ preventScroll: true });
                } else if (!open && wasOpen && !activeModal()) {
                    modal._returnFocus?.focus({ preventScroll: true });
                }
                wasOpen = open;
            }
            new MutationObserver(sync).observe(modal, { attributes: true, attributeFilter: ['class'] });
            sync();
        });
        document.addEventListener('keydown', event => {
            if (event.key !== 'Tab') return;
            const modal = activeModal();
            const mobileOpen = menu?.classList.contains('active');
            const items = modal ? focusable(modal) : mobileOpen ? [hamburger, ...focusable(menu)] : [];
            if (!items.length) return;
            const first = items[0], last = items[items.length - 1];
            if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) {
                event.preventDefault(); first.focus();
            }
        });
        document.addEventListener('focusin', event => {
            const modal = activeModal();
            if (modal && !modal.contains(event.target)) focusable(modal)[0]?.focus({ preventScroll: true });
        });
    });
})();
