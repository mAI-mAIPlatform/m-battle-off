export const Input = {
    k: {},
    jL: { a: 0, x: 0, y: 0, i: null },
    jR: { a: 0, x: 0, y: 0, i: null },
    m: { x: 0, y: 0, d: 0 },

    init() {
        window.addEventListener('keydown', e => {
            this.k[e.code] = 1;
            if (window.game && window.game.player) {
                if (e.code === 'Space') window.game.player.dash();
                if (e.code === 'KeyE') window.game.player.useGadget();
                if (e.code === 'KeyV') { if(window.ui) window.ui.toggleEmoteWheel(); }
            }
        });

        window.addEventListener('keyup', e => this.k[e.code] = 0);

        window.addEventListener('mousemove', e => {
            this.m.x = e.clientX;
            this.m.y = e.clientY;
        });

        window.addEventListener('mousedown', () => this.m.d = 1);
        window.addEventListener('mouseup', () => this.m.d = 0);

        this.initMobileControls();
    },

    initMobileControls() {
        const z = document.getElementById('mobile-controls');
        if (!z) return;

        const leftBase = document.getElementById('stick-left-base');
        const rightBase = document.getElementById('stick-right-base');

        // Calculate base centers for touch processing
        const getCenter = (el) => {
            const rect = el.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        };

        const h = (e, isEnd) => {
            if (e.target.tagName !== 'BUTTON') e.preventDefault();
            let lf = false, rf = false;

            // Re-fetch centers in case of resize/layout change
            const L_CENTER = getCenter(leftBase);
            const R_CENTER = getCenter(rightBase);

            for (let i = 0; i < e.touches.length; i++) {
                const t = e.touches[i], x = t.clientX, y = t.clientY;

                // Check if touch is near the left joystick area
                if (Math.hypot(x - L_CENTER.x, y - L_CENTER.y) < 150) {
                    lf = true;
                    const d = Math.min(60, Math.hypot(x - L_CENTER.x, y - L_CENTER.y));
                    const a = Math.atan2(y - L_CENTER.y, x - L_CENTER.x);
                    const k = document.querySelector('#stick-left-base .stick-knob');
                    if (k) k.style.transform = `translate(-50%,-50%) translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px)`;
                    if (d > 5) {
                        this.jL.x = Math.cos(a) * d / 60;
                        this.jL.y = Math.sin(a) * d / 60;
                        this.jL.a = 1;
                    }
                }

                // Check if touch is near the right joystick/action area
                if (Math.hypot(x - R_CENTER.x, y - R_CENTER.y) < 150) {
                    rf = true;
                    const d = Math.min(60, Math.hypot(x - R_CENTER.x, y - R_CENTER.y));
                    const a = Math.atan2(y - R_CENTER.y, x - R_CENTER.x);
                    const k = document.querySelector('#stick-right-base .stick-knob');
                    if (k) k.style.transform = `translate(-50%,-50%) translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px)`;
                    if (d > 5) {
                        this.jR.x = Math.cos(a) * d / 60;
                        this.jR.y = Math.sin(a) * d / 60;
                        this.jR.a = 1;
                    }
                }
            }
            if (!lf) {
                this.jL.x = 0; this.jL.y = 0; this.jL.a = 0;
                const k = document.querySelector('#stick-left-base .stick-knob');
                if (k) k.style.transform = `translate(-50%,-50%)`;
            }
            if (!rf) {
                this.jR.x = 0; this.jR.y = 0; this.jR.a = 0;
                const k = document.querySelector('#stick-right-base .stick-knob');
                if (k) k.style.transform = `translate(-50%,-50%)`;
            }
        };

        // Use passive: false to prevent scrolling
        z.addEventListener('touchstart', e => h(e, false), { passive: false });
        z.addEventListener('touchmove', e => h(e, false), { passive: false });
        z.addEventListener('touchend', e => h(e, true));
    }
};
