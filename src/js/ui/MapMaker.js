import { USER } from '../core/State.js';
import { save } from '../core/Storage.js';

export const MapMaker = {
    active: false,
    grid: [],
    size: 20,
    init() {
        this.grid = [];
        for (let i = 0; i < this.size * this.size; i++) this.grid.push(0);
        this.renderEditor();
    },
    renderEditor() {
        const el = document.getElementById('map-maker-ui');
        if (!el) {
            const d = document.createElement('div');
            d.id = 'map-maker-ui';
            d.className = 'absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center';
            d.innerHTML = `
                <div class="absolute top-4 left-4 text-white font-tech text-xl">MAP MAKER <span class="text-green-400">BETA</span></div>
                <button id="mm-close-btn" class="absolute top-4 right-4 text-red-500 text-2xl font-bold">×</button>
                <div class="grid grid-cols-20 gap-0.5 bg-gray-900 border border-white/20 p-2" id="mm-grid" style="grid-template-columns: repeat(20, 1fr);">
                    ${this.grid.map((c, i) => `<div id="cell-${i}" class="w-4 h-4 ${c === 1 ? 'bg-white' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer"></div>`).join('')}
                </div>
                <div class="flex gap-4 mt-6">
                    <button id="mm-play-btn" class="glass-btn px-6 py-2 bg-green-600 hover:bg-green-500">JOUER</button>
                    <button id="mm-save-btn" class="glass-btn px-6 py-2">SAUVEGARDER</button>
                    <button id="mm-clear-btn" class="glass-btn px-6 py-2 text-red-400">EFFACER</button>
                </div>
            `;
            document.body.appendChild(d);

            // Event listeners
            document.getElementById('mm-close-btn').onclick = () => document.getElementById('map-maker-ui').remove();
            document.getElementById('mm-play-btn').onclick = () => this.play();
            document.getElementById('mm-save-btn').onclick = () => this.save();
            document.getElementById('mm-clear-btn').onclick = () => this.clear();

            // Grid clicks (delegation or direct binding? template string makes direct binding hard without eval)
            // Re-render handled this in original code by onclick attribute.
            // In module, global scope is not available for onclick="MapMaker.toggle(i)".
            // I must attach listeners.
            this.attachGridListeners();

        } else {
            document.getElementById('mm-grid').innerHTML = this.grid.map((c, i) => `<div id="cell-${i}" class="w-4 h-4 ${c === 1 ? 'bg-white' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer"></div>`).join('');
            this.attachGridListeners();
        }
    },
    attachGridListeners() {
         const cells = document.querySelectorAll('#mm-grid > div');
         cells.forEach((cell, i) => {
             cell.onclick = () => this.toggle(i);
         });
    },
    toggle(i) {
        this.grid[i] = this.grid[i] === 0 ? 1 : 0;
        document.getElementById(`cell-${i}`).className = `w-4 h-4 ${this.grid[i] === 1 ? 'bg-white' : 'bg-gray-800 hover:bg-gray-700'} cursor-pointer`;
    },
    save() {
        const name = prompt("Nom de la carte ?");
        if (name) {
            if (!USER.maps) USER.maps = [];
            USER.maps.push({
                name,
                grid: [...this.grid],
                date: Date.now()
            });
            save();
            alert("Carte sauvegardée !");
            document.getElementById('map-maker-ui').remove();
        }
    },
    play() {
        if (!confirm("Jouer sur cette carte ?")) return;
        // Set custom game mode
        if (window.game) {
            window.game.customGrid = [...this.grid];
            window.game.conf.mode = 'custom';
            document.getElementById('map-maker-ui').remove();
            if (window.ui) window.ui.showTab('play');
            window.game.start();
        }
    },
    clear() {
        this.grid = this.grid.map(() => 0);
        this.renderEditor();
    }
};
