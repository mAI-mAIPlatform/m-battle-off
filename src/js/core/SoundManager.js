import { USER } from './State.js';

export const SoundManager = {
    ctx: null,
    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if(AudioContext) this.ctx = new AudioContext();
        } catch(e) { console.error("Audio init failed", e); }
    },
    play(id) {
        if(typeof USER !== 'undefined' && USER.settings && !USER.settings.sound) return;
        if(!this.ctx) this.init();
        if(!this.ctx) return;

        const t = this.ctx.currentTime;

        // Helper for noise
        const playNoise = (duration, filterFreq) => {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq || 1000, t);
            filter.frequency.exponentialRampToValueAtTime(100, t + duration); // Filter sweep

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + duration);
        };

        const osc = (type, freq, dur, vol=0.1, sweep=0) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freq, t);
            if(sweep) o.frequency.exponentialRampToValueAtTime(sweep, t + dur);

            g.gain.setValueAtTime(vol, t);
            g.gain.exponentialRampToValueAtTime(0.01, t + dur);

            o.connect(g);
            g.connect(this.ctx.destination);
            o.start(t);
            o.stop(t + dur);
        };

        if(id === 'click' || id === 'ui') {
            osc('sine', 800, 0.05, 0.05, 1200);
        } else if(id === 'shoot') {
            // Layered shoot sound
            playNoise(0.1, 800);
            osc('square', 150, 0.1, 0.05, 40);
        } else if(id === 'hit') {
            osc('sawtooth', 200, 0.1, 0.05, 50);
        } else if(id === 'start') {
            osc('triangle', 300, 0.5, 0.1, 600);
            setTimeout(() => osc('triangle', 600, 0.5, 0.1, 1200), 100);
        } else if(id === 'win') {
            osc('triangle', 440, 0.2, 0.1);
            setTimeout(() => osc('triangle', 554, 0.2, 0.1), 100); // C#
            setTimeout(() => osc('triangle', 659, 0.4, 0.1), 200); // E
        } else if(id === 'lose') {
            osc('sawtooth', 300, 0.4, 0.1, 100);
            setTimeout(() => osc('sawtooth', 200, 0.4, 0.1, 50), 300);
        } else if(id === 'collect') {
            osc('sine', 1200, 0.1, 0.05); // High ping
        } else if(id === 'purchase') {
            osc('sine', 1500, 0.1, 0.05);
            setTimeout(()=>osc('sine', 2000, 0.1, 0.05), 50);
        } else if(id === 'error') {
            osc('sawtooth', 150, 0.2, 0.1, 100);
        } else if(id === 'levelup') {
            osc('triangle', 400, 0.2, 0.1);
            setTimeout(()=>osc('triangle', 500, 0.2, 0.1), 100);
            setTimeout(()=>osc('triangle', 600, 0.2, 0.1), 200);
            setTimeout(()=>osc('triangle', 800, 0.4, 0.2), 300);
        } else if(id === 'open_chest') {
            playNoise(0.5, 300);
            osc('sine', 800, 0.3, 0.1, 100);
            setTimeout(()=>osc('triangle', 1200, 0.4, 0.1), 200);
        } else if(id === 'equip') {
             osc('square', 300, 0.05, 0.05, 400);
        } else if(id === 'ui_hover') {
             osc('sine', 440, 0.02, 0.01);
        } else if(id === 'start_game') {
             osc('sawtooth', 200, 0.5, 0.1, 50);
             setTimeout(()=>osc('sawtooth', 100, 0.5, 0.1), 200);
        }
    }
};
