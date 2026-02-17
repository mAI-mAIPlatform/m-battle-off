import { Game } from './core/Game.js';
import { UI } from './ui/UI.js';
import { QuestSystem } from './core/QuestSystem.js';

// Expose Game and UI to window for global access (needed for inline HTML event handlers)
window.game = Game;
window.ui = UI;
window.QuestSystem = QuestSystem;

window.onload = function() {
    if (window.game) {
        window.game.init();
        window.ui.showIntro();

        // EVENT: NOEL SNOW
        const now = new Date();
        if (now.getMonth() === 11 || (now.getMonth() === 0 && now.getDate() < 15)) {
            // Start snow effect
            const c = document.getElementById('season-particles');
            if (c) {
                for (let i = 0; i < 50; i++) {
                    const s = document.createElement('div');
                    s.className = 'absolute bg-white rounded-full opacity-0 animate-snow';
                    s.style.width = Math.random() * 4 + 2 + 'px';
                    s.style.height = s.style.width;
                    s.style.left = Math.random() * 100 + '%';
                    s.style.animationDuration = Math.random() * 10 + 5 + 's';
                    s.style.animationDelay = Math.random() * 5 + 's';
                    s.style.opacity = Math.random() * 0.5 + 0.3;
                    c.appendChild(s);
                }
                const style = document.createElement('style');
                style.innerHTML = `
                    @keyframes animate-snow {
                        0% { top: -10px; transform: translateX(0); }
                        100% { top: 100%; transform: translateX(${Math.random()*100 - 50}px); }
                    }
                    .animate-snow { animation-name: animate-snow; animation-iteration-count: infinite; animation-timing-function: linear; }
                `;
                document.head.appendChild(style);
            }
            // Visual Banner for Event
            setTimeout(() => {
                if(window.ui) window.ui.notif("Joyeuses Fêtes ! 🎅🎄", "#ef4444");
            }, 2000);
        }
    }
};
