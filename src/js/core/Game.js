import { Input } from './Input.js';
import { Storage, save } from './Storage.js';
import { SoundManager } from './SoundManager.js';
import { QuestSystem } from './QuestSystem.js';
import { USER, updateUser } from './State.js';
import { CFG, DIFFICULTY, MODIFIERS, RATE_FACTOR } from '../data/constants.js';
import { MODES, ARENAS, RANKS } from '../data/gameData.js';
import { STARTERS } from '../data/heroes.js';
import { Player } from '../entities/Player.js';
import { Bot } from '../entities/Bot.js';
import { Enemy } from '../entities/Enemy.js';
import { Train } from '../entities/Train.js';
import { Payload } from '../entities/Payload.js';
import { Wall } from '../entities/Wall.js';
import { Flag } from '../entities/Flag.js';
import { Turret } from '../entities/Turret.js';
import { Rnd, Dist, ColRect, resolveCollision } from './Utils.js';
import { MapMaker } from '../ui/MapMaker.js'; // Will be created in next step

export const Game = {
    cvs: null,
    ctx: null,
    conf: { mode: 'survival', arena: 'tokyo', difficulty: 'normal', modifier: 'normal' },
    state: 'MENU',
    frame: 0,
    world: 2500,
    cam: { x: 0, y: 0 },
    shake: 0,
    gasRadius: 0,
    timeLeft: 0,
    player: null,
    ents: [],
    projs: [],
    parts: [],
    bgParts: [],
    decals: [],
    items: [],
    texts: [],
    score: 0,
    wave: 1,
    boost: false,
    train: null,
    lootCollected: 0,
    hackProgress: 0,
    killCount: 0,
    zoneProgress: 0,
    activeModifier: null,
    chaosTimer: 0,
    adventure: null,
    customGrid: null,
    teamScore: 0,
    enemyScore: 0,
    bossKills: 0,
    killStreak: 0,
    lastKillTime: 0,
    flags: [],

    init() {
        this.cvs = document.getElementById('gameCanvas');
        this.ctx = this.cvs.getContext('2d');
        this.resize();
        window.onresize = () => this.resize();
        Input.init();
        Storage.load();
        // Initialize conf with loaded/default values
        if (typeof this.conf.difficulty === 'undefined') this.conf.difficulty = 'normal';
        if (typeof this.conf.modifier === 'undefined') this.conf.modifier = 'normal';
        if (typeof this.conf.bots === 'undefined') this.conf.bots = 0;

        if(window.ui) window.ui.updateMenu();
        if ('ontouchstart' in window) document.getElementById('mobile-controls').classList.remove('hidden');
        this.loop();
    },

    resize() {
        this.cvs.width = window.innerWidth;
        this.cvs.height = window.innerHeight;
        CFG.w = this.cvs.width;
        CFG.h = this.cvs.height;
    },

    setBots(n) {
        this.conf.bots = n;
        save();
        if(window.ui) window.ui.renderBotSelector();
    },

    setStarter(k) {
        USER.selected = k;
        save();
        if(window.ui) {
            window.ui.updateMenu();
            window.ui.showTab('play');
        }
    },

    setMode(m) {
        this.conf.mode = m;
        save();
        if(window.ui) {
            window.ui.updateMenu();
            window.ui.showTab('play');
        }
    },

    setArena(a) {
        this.conf.arena = a;
        save();
        if(window.ui) {
            window.ui.updateMenu();
            window.ui.showTab('play');
        }
    },

    setDifficulty(d) {
        if (DIFFICULTY[d]) {
            this.conf.difficulty = d;
            save();
            if(window.ui) {
                window.ui.updateMenu();
                window.ui.showTab('play');
            }
        }
    },

    setModifier(m) {
        this.conf.modifier = m;
        save();
        if(window.ui) {
            window.ui.updateMenu();
            window.ui.updateDifficultyButtons();
        }
    },

    start() {
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');

        // Track Stats
        if (!USER.stats.modes) USER.stats.modes = {};
        USER.stats.modes[this.conf.mode] = (USER.stats.modes[this.conf.mode] || 0) + 1;
        save();

        const hudLvl = document.getElementById('hud-lvl');
        if(hudLvl) hudLvl.innerText = 'LVL ' + (USER.levels[USER.selected] || 1);

        const hudIcon = document.getElementById('hud-icon');
        if(hudIcon) hudIcon.innerHTML = STARTERS[USER.selected].icon;

        this.player = new Player(USER.selected);
        this.ents = [];
        this.projs = [];
        this.parts = [];
        this.bgParts = [];
        this.decals = [];
        this.items = [];
        this.texts = [];
        this.score = 0;
        this.wave = 1;
        this.gasRadius = 0;
        this.timeLeft = 3 * 60 * 60;
        this.map = [];
        this.train = null;
        this.lootCollected = 0;
        this.hackProgress = 0;
        this.killCount = 0;
        this.zoneProgress = 0;
        this.teamScore = 0;
        this.enemyScore = 0;
        this.bossKills = 0;
        this.killStreak = 0;
        this.lastKillTime = 0;

        // Objective Notification
        setTimeout(() => {
            let obj = "SURVIVRE";
            if (this.conf.mode === 'heist') obj = "DÉTRUIS LE COFFRE";
            else if (this.conf.mode === 'rampage') obj = "50 KILLS";
            else if (this.conf.mode === 'team_battle') obj = "40 KILLS D'ÉQUIPE";
            else if (this.conf.mode === 'ctf') obj = "3 DRAPEAUX";
            else if (this.conf.mode === 'defense') obj = "PROTÈGE LE CRISTAL";
            else if (this.conf.mode === 'train_defense') obj = "PROTÈGE LE TRAIN";
            else if (this.conf.mode === 'cyber_hack') obj = "PIRATE LE TERMINAL";
            else if (this.conf.mode === 'escape') obj = "ATTEINS L'EXTRACTION";
            else if (this.conf.mode === 'zone_control') obj = "CAPTURE LA ZONE";
            else if (this.conf.mode === 'thief') obj = "VOLE 10 SACS";
            else if (this.conf.mode === 'payload') obj = "POUSSE LE WAGON";
            else if (this.conf.mode === 'royale') obj = "SURVIVRE À LA ZONE";

            if(window.ui) window.ui.notif("OBJECTIF : " + obj, "#22d3ee");
        }, 1000);

        if (this.conf.mode === 'custom' && this.customGrid) {
            // Custom Map Generation
            this.customGrid.forEach((val, i) => {
                if (val === 1) {
                    const col = i % 20;
                    const row = Math.floor(i / 20);
                    const x = col * 100;
                    const y = row * 100;
                    this.map.push(new Wall(x, y, 100, 100, 0));
                }
            });
            if(window.ui) window.ui.notif("CARTE PERSONNALISÉE", "#22d3ee");
        } else {
            for (let i = 0; i < 25; i++) {
                const w = Math.random() * 150 + 50,
                    h = Math.random() * 150 + 50,
                    x = Math.random() * (this.world - w),
                    y = Math.random() * (this.world - h);
                if (Math.hypot(x - this.world / 2, y - this.world / 2) > 400) this.map.push(new Wall(x, y, w, h, 0));
            }

            for (let i = 0; i < 38; i++) {
                const w = Math.random() * 100 + 100,
                    h = Math.random() * 100 + 100,
                    x = Math.random() * (this.world - w),
                    y = Math.random() * (this.world - h);
                this.map.push(new Wall(x, y, w, h, 1));
            }
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * (this.world - 60),
                    y = Math.random() * (this.world - 60);
                if (Math.hypot(x - this.world / 2, y - this.world / 2) > 400) this.map.push(new Wall(x, y, 60, 60, 3));
            }
        }
        const enemyBaseMult = 1 + (this.conf.mode === 'ranked' ? 0.2 : 0.1) * this.wave;
        if (this.conf.mode === 'duel') {
            const bot = new Bot();
            bot.x = this.world / 2 + 400;
            bot.y = this.world / 2;
            this.ents.push(bot);
            if(window.ui) window.ui.notif("1 VS 1", "#fff");
        } else if (this.conf.mode === 'heist') {
            const chest = new Enemy('chest', enemyBaseMult);
            chest.x = this.world / 2;
            chest.y = 100;
            this.ents.push(chest);
            this.spawnDefenders(chest.x, chest.y, 3);
            this.map = this.map.filter(w => Math.hypot(w.x - chest.x, w.y - chest.y) > 300 && Math.hypot(w.x - this.player.x, w.y - this.player.y) > 300);
            if(window.ui) window.ui.notif("DÉTRUIS LE COFFRE !", "#facc15");
        } else if (this.conf.mode === 'boss_rush') {
            this.ents.push(new Enemy('boss', 3));
            if(window.ui) window.ui.notif("BOSS RUSH !", "#ef4444");
        } else if (this.conf.mode === 'titan_raid') {
            for (let i = 0; i < 5; i++) {
                const boss = new Enemy('boss', 3);
                boss.x = this.world / 2 + Rnd(-200, 200);
                boss.y = this.world / 2 + Rnd(-200, 200);
                this.ents.push(boss);
            }
            if(window.ui) window.ui.notif("RAID TITAN (5 BOSS) !", "#ef4444");
        } else if (this.conf.mode === 'train_defense') {
            this.train = new Train();
            this.ents.push(this.train);
            this.map = this.map.filter(w => Math.abs(w.y - this.world / 2) > 100); // Clear path for train
            if(window.ui) window.ui.notif("PROTÈGE LE TRAIN !", "#3b82f6");
        } else if (this.conf.mode === 'thief') {
            // Spawn Loot
            for (let i = 0; i < 15; i++) {
                this.items.push({
                    x: Rnd(100, this.world - 100),
                    y: Rnd(100, this.world - 100),
                    type: 'loot_bag'
                });
            }
            if(window.ui) window.ui.notif("VOLE 10 SACS !", "#facc15");
        } else if (this.conf.mode === 'cyber_hack') {
            // Spawn Hack Terminal
            const term = new Enemy('chest', enemyBaseMult * 5); // Use chest model as terminal base but stronger
            term.x = this.world / 2;
            term.y = this.world / 2;
            term.type = 'terminal';
            term.c = '#22d3ee';
            this.ents.push(term);
            // Clear center
            this.map = this.map.filter(w => Math.hypot(w.x - term.x, w.y - term.y) > 400);
            if(window.ui) window.ui.notif("PIRATE LE TERMINAL !", "#22d3ee");
        } else if (this.conf.mode === 'escape') {
            // Spawn extraction point at end of world
            const exit = new Enemy('chest', 10);
            exit.x = this.world - 150;
            exit.y = this.world - 150;
            exit.type = 'exit';
            exit.c = '#10b981';
            exit.r = 60;
            this.ents.push(exit);
            // Clear area
            this.map = this.map.filter(w => Math.hypot(w.x - exit.x, w.y - exit.y) > 400);
            if(window.ui) window.ui.notif("REJOINS L'EXTRACTION !", "#10b981");
        } else if (this.conf.mode === 'thunder_capture') {
            this.thunderZone = {
                x: this.world / 2,
                y: this.world / 2,
                r: 250,
                nx: this.world / 2,
                ny: this.world / 2,
                progress: 0
            };
            this.map = this.map.filter(w => Math.abs(w.x - this.world / 2) > 300 || Math.abs(w.y - this.world / 2) > 300); // Clear center
            if(window.ui) window.ui.notif("RESTE DANS LA ZONE !", "#facc15");
        } else if (this.conf.mode === 'rampage') {
            if(window.ui) window.ui.notif("CARNAGE : 50 KILLS", "#ef4444");
        } else if (this.conf.mode === 'zone_control') {
            // Zone centrale
            if(window.ui) window.ui.notif("CONTRÔLE LA ZONE", "#a855f7");
        } else if (this.conf.mode === 'defense') {
            const core = new Enemy('chest', 5);
            core.type = 'core';
            core.x = this.world / 2;
            core.y = this.world / 2;
            core.c = '#3b82f6';
            this.ents.push(core);
            this.map = this.map.filter(w => Math.hypot(w.x - core.x, w.y - core.y) > 400);
            if(window.ui) window.ui.notif("PROTÈGE LE CRISTAL !", "#3b82f6");
        } else if (this.conf.mode === 'sniper_duel') {
            const bot = new Bot();
            bot.x = this.world / 2 + 600;
            bot.y = this.world / 2;
            bot.c = '#a855f7'; // Sniper color
            this.ents.push(bot);
            if(window.ui) window.ui.notif("DUEL SNIPER", "#a855f7");
        } else if (this.conf.mode === 'giant_hunt') {
            const boss = new Enemy('boss', 5); // Huge HP
            boss.x = this.world / 2;
            boss.y = this.world / 2;
            boss.r = 80;
            boss.name = "GÉANT";
            this.ents.push(boss);
            if(window.ui) window.ui.notif("CHASSE AU GÉANT", "#ef4444");
        } else if (this.conf.mode === 'golden_chase') {
            for (let i = 0; i < 30; i++) this.items.push({
                x: Rnd(100, this.world - 100),
                y: Rnd(100, this.world - 100),
                t: 'coins',
                val: 50
            });
            this.timeLeft = 120 * 60; // 2 Minutes
            if(window.ui) window.ui.notif("SURVIVRE & COLLECTER !", "#eab308");
        } else if (this.conf.mode === 'infection_hard') {
            // Start with more enemies
            for (let i = 0; i < 20; i++) this.ents.push(new Enemy('fast', 1.5));
            if(window.ui) window.ui.notif("INFECTION EXTRÊME", "#dc2626");
        } else if (this.conf.mode === 'speed_run') {
            const exit = new Enemy('chest', 1);
            exit.type = 'exit';
            exit.x = this.world - 100;
            exit.y = this.world - 100;
            exit.c = '#22d3ee';
            this.ents.push(exit);
            if(window.ui) window.ui.notif("SPEED RUN !", "#22d3ee");

        } else if (this.conf.mode === 'team_battle') {
            // Spawn Friendly Bots
            for (let i = 0; i < 3; i++) {
                const fb = new Bot(true);
                fb.x = this.player.x + Rnd(-200, 200);
                fb.y = this.player.y + Rnd(-200, 200);
                this.ents.push(fb);
            }
            if (this.adventure && this.adventure.mode === 'duel') {
                // Force duel opponent only
                const opp = new Enemy('boss', 1);
                opp.isBoss = true;
                opp.name = "RIVAL";
                opp.x = this.world / 2;
                opp.y = this.world / 2;
                this.ents.push(opp);
            }
            // Enemy bots will be spawned by loop but let's spawn 4 immediately
            for (let i = 0; i < 4; i++) {
                const eb = new Bot(false);
                eb.x = this.world - 200 + Rnd(-100, 100);
                eb.y = this.world - 200 + Rnd(-100, 100);
                this.ents.push(eb);
            }
            if(window.ui) window.ui.notif("BATAILLE D'ÉQUIPE !", "#3b82f6");
        } else if (this.conf.mode === 'ctf') {
            for (let i = 0; i < 3; i++) {
                const fb = new Bot(true);
                fb.x = this.player.x + Rnd(-200, 200);
                fb.y = this.player.y + Rnd(-200, 200);
                this.ents.push(fb);
            }
            for (let i = 0; i < 4; i++) {
                const eb = new Bot(false);
                eb.x = this.world - 200 + Rnd(-100, 100);
                eb.y = this.world - 200 + Rnd(-100, 100);
                this.ents.push(eb);
            }
            this.flags = [];
            const blueFlag = new Flag('blue', this.player.x, this.player.y - 50);
            const redFlag = new Flag('red', this.world - 200, this.world - 200);
            this.flags.push(blueFlag, redFlag);
            this.ents.push(blueFlag, redFlag);
            if(window.ui) window.ui.notif("CAPTURE LE DRAPEAU !", "#facc15");
        } else if (this.conf.mode === 'payload') {
            this.train = new Payload(); // Reuse this.train variable for simplicity/compatibility since logic is similar
            this.ents.push(this.train);
            this.map = this.map.filter(w => Math.abs(w.y - this.world / 2) > 150); // Clear wider path
            if(window.ui) window.ui.notif("POUSSE LE WAGON !", "#f97316");
        } else if (this.conf.mode === 'royale') {
            this.gasRadius = this.world;
            const heroes = Object.keys(STARTERS);
            // FIX: Reduced spawn count for Battle Royale to prevent overcrowding
            for (let i = 0; i < 12; i++) {
                const rndHero = heroes[Math.floor(Math.random() * heroes.length)];
                const b = new Bot(false, rndHero);
                b.x = Rnd(100, this.world - 100);
                b.y = Rnd(100, this.world - 100);
                // Prevent spawn on player
                if (Dist(b, this.player) > 400) this.ents.push(b);
            }
            if(window.ui) window.ui.notif("SURVIVRE À LA ZONE !", "#ef4444");
        } else {
            if(window.ui) window.ui.notif(MODES[this.conf.mode].name.toUpperCase(), "#fff");
        }

        if(hudIcon) hudIcon.innerHTML = STARTERS[USER.selected].icon;
        this.state = 'PLAYING'; // Set state to PLAYING
    },

    spawnDefenders(cx, cy, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const e = new Enemy('basic', 1);
            e.x = cx + Math.cos(angle) * 150;
            e.y = cy + Math.sin(angle) * 150;
            this.ents.push(e);
        }
    },

    togglePause() {
        this.state = this.state === 'PLAYING' ? 'PAUSED' : (this.state === 'PAUSED' ? 'PLAYING' : this.state);
    },

    toMenu() {
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
        document.getElementById('hud').classList.add('hidden');
        this.state = 'MENU';
        if(window.ui) window.ui.updateMenu();
        this.boost = false;
        this.adventure = null;
    },

    over(r) {
        this.state = 'GAMEOVER';
        document.getElementById('gameover-screen').classList.remove('hidden');

        // Stats updates
        if (r !== "VICTOIRE") {
            USER.stats.losses++;
        }

        const title = document.getElementById('go-title');
        if (r === "VICTOIRE") {
            title.innerText = "VICTOIRE";
            title.className = "text-6xl md:text-8xl font-black text-yellow-400 mb-2 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)] tracking-tighter animate-bounce";
        } else {
            title.innerText = "KO";
            title.className = "text-8xl font-black text-white mb-2 drop-shadow-2xl tracking-tighter";
        }
        const goReason = document.getElementById('go-reason');
        if(goReason) goReason.innerText = r;

        // Feature 2: Score Multiplier
        let finalScore = this.score * DIFFICULTY[this.conf.difficulty].mult;

        const goScore = document.getElementById('go-score');
        if(goScore) goScore.innerText = Math.floor(finalScore);

        let gt = 1 + Math.floor(finalScore / 100) * 2;
        if (this.boost) gt *= 2;
        if (this.boost) gt *= 2;
        if ((this.conf.mode === 'duel' || this.conf.mode === 'heist' || this.conf.mode === 'boss_rush' || this.conf.mode === 'titan_raid' || this.conf.mode === 'train_defense' || this.conf.mode === 'cyber_hack' || this.conf.mode === 'escape' || this.conf.mode === 'rampage' || this.conf.mode === 'zone_control' || this.conf.mode === 'team_battle') && r === "VICTOIRE") {
            gt += 20;
            USER.stats.wins++;
        }
        let gc = Math.floor(finalScore / 10);
        if (r === "VICTOIRE") gc += 50;
        if (finalScore >= 200 || r === "VICTOIRE") {
            USER.pass.xp += 50;
            while (USER.pass.xp >= 100) {
                if (USER.pass.tier < 50) {
                    USER.pass.tier++;
                    USER.pass.xp -= 100;
                    if(window.ui) window.ui.notif("PASS LEVEL UP!", "#facc15");
                } else {
                    USER.pass.xp = 100;
                    break;
                }
            }
        }

        // New Rank Detection
        let oldR = 0;
        for (let i = 0; i < RANKS.length; i++) {
            if (USER.trophies >= RANKS[i].t) oldR = i;
        }

        USER.trophies += gt;
        USER.coins += gc;

        let newR = 0;
        for (let i = 0; i < RANKS.length; i++) {
            if (USER.trophies >= RANKS[i].t) newR = i;
        }

        if (newR > oldR) {
            const newRank = RANKS[newR];
            setTimeout(() => {
                if(window.ui) window.ui.notif(`RANG ATTEINT : ${newRank.n} !`, newRank.c);
            }, 500);
        }

        USER.stats.maxWave = Math.max(USER.stats.maxWave, this.wave);
        USER.stats.games++;
        USER.stats.maxPassTier = Math.max(USER.stats.maxPassTier || 1, USER.pass.tier); // Mise à jour de la stat de Palier Max

        // Quest Check
        if (QuestSystem) {
            QuestSystem.check('play', {
                mode: this.conf.mode,
                arena: this.conf.arena,
                hero: USER.selected
            });
            if (r === "VICTOIRE") QuestSystem.check('win', {
                mode: this.conf.mode
            });
            QuestSystem.check('survive', {
                wave: this.wave
            });
        }

        // --- MASTERY XP & SOUNDS ---
        if (r === "VICTOIRE") {
            if (SoundManager) SoundManager.play('win');

            // ADVENTURE PROGRESSION
            if (this.adventure) {
                if(window.ui) window.ui.completeAdventurePart(this.adventure.id);
                this.adventure = null; // Clear active adventure
            }

            const mXpGain = 50;
            if (!USER.mastery) USER.mastery = {};
            if (!USER.mastery[USER.selected]) USER.mastery[USER.selected] = {
                xp: 0,
                lvl: 1
            };
            USER.mastery[USER.selected].xp += mXpGain;
            if(window.ui) window.ui.notif(`+${mXpGain} MAÎTRISE`, "#fbbf24");
        } else {
            const mXpGain = 10;
            if (!USER.mastery) USER.mastery = {};
            if (!USER.mastery[USER.selected]) USER.mastery[USER.selected] = {
                xp: 0,
                lvl: 1
            };
            USER.mastery[USER.selected].xp += mXpGain;
        }

        save();
        const goRewards = document.getElementById('go-rewards');
        if(goRewards) goRewards.innerText = `+${gt}🏆 +${gc}🪙`;
    },

    drawTerrainEffects() {
        if (this.state !== 'PLAYING') return;
        const arena = this.conf.arena;
        let spawnRate = 0.3;
        let color = 'rgba(255,255,255,0.5)';
        let vy = 2;
        let vx = 0;
        let size = 3;
        let life = 200;
        let isRect = false;

        // Configs uniques par terrain
        if (arena === 'ice') {
            spawnRate = 0.9;
            color = 'rgba(220,240,255,0.8)';
            vy = 3.5;
            vx = 1;
        } else if (arena === 'magma') {
            spawnRate = 0.6;
            color = 'rgba(255,80,0,0.6)';
            vy = -3;
            size = 5;
        } else if (arena === 'tokyo') {
            spawnRate = 0.3;
            color = 'rgba(0, 255, 200, 0.4)';
            vy = 5;
            isRect = true;
        } else if (arena === 'cyber_city') {
            spawnRate = 0.3;
            color = 'rgba(232, 121, 249, 0.4)';
            vy = 6;
            isRect = true;
        } else if (arena === 'sand') {
            spawnRate = 0.7;
            color = 'rgba(230,180,50,0.4)';
            vy = 4;
            vx = 3;
        } else if (arena === 'jungle') {
            spawnRate = 0.4;
            color = 'rgba(50, 200, 100, 0.4)';
            vy = 1.5;
            vx = -0.5;
        } else if (arena === 'nebula') {
            spawnRate = 0.6;
            color = 'rgba(168, 85, 247, 0.5)';
            vy = 0.5;
            vx = 0.5;
            size = 2;
        } else if (arena === 'mainframe') {
            spawnRate = 1.0;
            color = 'rgba(34, 211, 238, 0.6)';
            vy = -4.5;
            size = 2;
            isRect = true;
        } // Code rain up
        else if (arena === 'ruins') {
            spawnRate = 0.8;
            color = 'rgba(148, 163, 184, 0.5)';
            vy = 5;
            vx = -1;
        } // Rain
        else if (arena === 'moon') {
            spawnRate = 0.2;
            color = 'rgba(255, 255, 255, 0.8)';
            vy = -0.05;
            size = 1.5;
        } // Stars
        else if (arena === 'crystal') {
            spawnRate = 0.6;
            color = 'rgba(192, 132, 252, 0.6)';
            vy = -1;
            vx = 0;
            size = 4;
        } // Glitter
        else if (arena === 'solaris') {
            spawnRate = 0.5;
            color = 'rgba(253, 186, 116, 0.6)';
            vy = -4;
            size = 5;
        } // Sparks
        else if (arena === 'atlantis') {
            spawnRate = 0.7;
            color = 'rgba(147, 197, 253, 0.4)';
            vy = -2;
            size = 6;
        } // Bubbles
        else if (arena === 'dungeon') {
            spawnRate = 0.4;
            color = 'rgba(20, 20, 20, 0.8)';
            vy = 3;
            size = 4;
            vx = 0;
        } // Darkness drops
        else if (arena === 'swamp') {
            spawnRate = 0.8;
            color = 'rgba(100, 255, 50, 0.4)';
            vy = -1;
            vx = 0.5;
            size = 5;
        } // Spores & Bubbles
        else if (arena === 'factory') {
            spawnRate = 1.0;
            color = Math.random() > 0.5 ? 'rgba(255, 120, 0, 0.8)' : 'rgba(100, 100, 100, 0.5)';
            vy = -3;
            vx = 1;
            size = 3;
        } // Smoke & Sparks
        else if (arena === 'void') {
            spawnRate = 0.6;
            color = 'rgba(139, 92, 246, 0.6)';
            vy = (Math.random() - 0.5) * 2;
            vx = (Math.random() - 0.5) * 2;
            size = 4;
        } // Cosmic Dust
        else if (arena === 'thunder_arena') {
            spawnRate = 0.8;
            color = 'rgba(250, 204, 21, 0.8)';
            vy = 10;
            vx = (Math.random() - 0.5) * 10;
            size = 2;
            isRect = true;
        } // Lightning Rain

        if (Math.random() < spawnRate) {
            this.bgParts.push({
                x: this.cam.x + Math.random() * CFG.w,
                y: (vy > 0 ? this.cam.y - 10 : this.cam.y + CFG.h + 10),
                vx: (Math.random() - 0.5) * 2 + vx,
                vy: vy * (0.8 + Math.random() * 0.4),
                life: life,
                c: color,
                r: Math.random() * size + 1,
                isRect: isRect
            });
        }
        for (let i = this.bgParts.length - 1; i >= 0; i--) {
            const p = this.bgParts[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) {
                this.bgParts.splice(i, 1);
                continue;
            }

            if (p.x < this.cam.x - 50 || p.x > this.cam.x + CFG.w + 50 || p.y < this.cam.y - 50 || p.y > this.cam.y + CFG.h + 50) {
                this.bgParts.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = p.c;
            this.ctx.beginPath();
            if (p.isRect) this.ctx.fillRect(p.x - this.cam.x, p.y - this.cam.y, p.r, p.r * 2);
            else this.ctx.arc(p.x - this.cam.x, p.y - this.cam.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();
        }
    },

    loop() {
        requestAnimationFrame(() => this.loop());
        this.frame++;
        const ctx = this.ctx;
        if (this.state === 'PLAYING') {

            // ADVENTURE SPECIFIC WIN CONDITIONS
            if (this.adventure) {
                const adv = this.adventure;
                if (adv.mode === 'survival' && this.wave > adv.target) this.over("VICTOIRE");
                if (adv.mode === 'collect' && adv.item === 'coins' && USER.coins >= (adv.startCoins || 0) + adv.target) this.over("VICTOIRE");
                // Note: coins check assumes we track start amount, or simpler: just check session retrieval
                // Let's rely on standard mode objectives which usually trigger over("VICTOIRE")
                // Rampege: killCount >= target
                if (adv.mode === 'rampage' && this.killCount >= adv.target) this.over("VICTOIRE");
            }
            // Chaos Modifier Logic
            if (this.conf.modifier === 'chaos') {
                if (this.frame % 600 === 0) { // Every 10 seconds
                    const mods = Object.keys(MODIFIERS).filter(k => k !== 'chaos' && k !== 'normal');
                    this.activeModifier = mods[Math.floor(Math.random() * mods.length)];
                    if(window.ui) window.ui.notif("CHAOS: " + MODIFIERS[this.activeModifier].name.toUpperCase(), MODIFIERS[this.activeModifier].color.replace('text-', '#').replace('text-xs ', '').replace('-300', '-400').replace('-400', '-400').replace('-500', '-500').replace('-600', '-600').split(' ')[0]);
                }
            } else {
                this.activeModifier = null;
            }

            if (this.conf.mode === 'heist' || this.conf.mode === 'boss_rush' || this.conf.mode === 'titan_raid' || this.conf.mode === 'train_defense' || this.conf.mode === 'cyber_hack') {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    if (this.conf.mode === 'train_defense') this.over("VICTOIRE");
                    else if (this.conf.mode === 'cyber_hack') this.over("ECHEC PIRATAGE");
                    else this.over("TEMPS ÉCOULÉ"); // Heist, Boss Rush, etc = Defeat if time runs out
                    return;
                }
            }
            if (this.conf.mode === 'escape') {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.over("TEMPS ÉCOULÉ");
                    return;
                }
            }
            if (this.conf.mode === 'golden_chase') {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.over("VICTOIRE");
                    return;
                }
            }
            if ((this.conf.mode === 'heist') && this.frame % (20 * 60) === 0) {
                const chest = this.ents.find(e => e.type === 'chest');
                if (chest) {
                    this.spawnDefenders(chest.x, chest.y, 3);
                    if(window.ui) window.ui.notif("RENFORTS !", "#ef4444");
                }
            }
            if (!this.ents) this.ents = [];
            if (!this.map) this.map = [];

            // SPAWN LOGIC
            if (this.conf.mode === 'survival' || this.conf.mode === 'ranked' || this.conf.mode === 'train_defense' || this.conf.mode === 'thief' || this.conf.mode === 'cyber_hack' || this.conf.mode === 'thunder_capture' || this.conf.mode === 'escape' || this.conf.mode === 'rampage' || this.conf.mode === 'zone_control' || this.conf.mode === 'golden_chase' || this.conf.mode === 'infection' || this.conf.mode === 'infection_hard' || this.conf.mode === 'heist' || this.conf.mode === 'defense' || this.conf.mode === 'treasure' || this.conf.mode === 'gungame' || this.conf.mode === 'payload') {
                if (!this.ents.find(e => e.isBoss && e.type !== 'train' && e.type !== 'terminal' && e.type !== 'exit' && e.type !== 'core' && e.type !== 'chest' && e.type !== 'payload')) {
                    let max = 4 + Math.floor(this.wave * 0.8);
                    if (this.conf.mode === 'rampage') max *= 2; // Double spawn for rampage
                    const enemyWaveMult = 1 + (this.conf.mode === 'ranked' ? 0.2 : 0.1) * this.wave;

                    // Feature 1: Mini-Boss Spawn (Vague 3 & 6)
                    if (this.frame % 1800 === 0) {
                        this.wave++;
                        if (this.wave % 5 === 0 && this.conf.mode !== 'thief' && this.conf.mode !== 'cyber_hack' && this.conf.mode !== 'escape' && this.conf.mode !== 'rampage' && this.conf.mode !== 'zone_control' && this.conf.mode !== 'golden_chase' && this.conf.mode !== 'payload' && this.conf.mode !== 'royale') {
                            this.ents.push(new Enemy('boss', enemyWaveMult * 2));
                            if(window.ui) window.ui.notif("BOSS !!!", "#ef4444");
                        } else if ((this.wave === 3 || this.wave === 6) && this.conf.mode !== 'thief' && this.conf.mode !== 'cyber_hack' && this.conf.mode !== 'escape' && this.conf.mode !== 'rampage' && this.conf.mode !== 'zone_control' && this.conf.mode !== 'golden_chase' && this.conf.mode !== 'payload' && this.conf.mode !== 'royale') {
                            this.ents.push(new Enemy('mini_boss', enemyWaveMult * 1.5));
                            if(window.ui) window.ui.notif("MINI BOSS !", "#facc15");
                        } else {
                            if(window.ui) window.ui.notif("VAGUE " + this.wave, "#fff");
                        }
                    }

                    // Spawn enemies
                    if (this.ents.filter(e => !e.friend && e.type !== 'train' && e.type !== 'terminal' && e.type !== 'exit').length < max && this.frame % 60 === 0 && this.conf.mode !== 'royale') {
                        let t = 'basic';
                        if (this.wave > 2 && Math.random() > 0.7) t = 'fast';
                        if (this.wave > 4 && Math.random() > 0.8) t = 'tank';
                        const en = new Enemy(t, enemyWaveMult);
                        // For Train mode, spawn near train sometimes
                        if (this.conf.mode === 'train_defense' && this.train && Math.random() < 0.5) {
                            en.x = this.train.x + Rnd(-300, 300);
                            en.y = this.train.y + Rnd(-300, 300);
                        }
                        // For Payload mode, spawn ahead of payload
                        if (this.conf.mode === 'payload' && this.train) {
                            en.x = this.train.x + 400 + Rnd(-200, 200);
                            en.y = this.train.y + Rnd(-300, 300);
                            en.x = Math.min(this.world - 50, Math.max(50, en.x)); // Clamp
                        }
                        // Escape mode: spawn near player (chose)
                        if (this.conf.mode === 'escape') {
                            en.x = this.player.x + Rnd(-400, 400);
                            en.y = this.player.y + Rnd(-400, 400);
                            if (Dist(en, this.player) < 300) {
                                en.x += 300;
                            }
                            en.mode = 'CHASE';
                        }
                        this.ents.push(en);
                    }

                }


                // Respawn logic for Team Battle & CTF
            } else if (this.conf.mode === 'team_battle' || this.conf.mode === 'ctf') {

                const friendlies = this.ents.filter(e => e.friend && e.isBot).length;
                const enemies = this.ents.filter(e => !e.friend && e.isBot).length;

                if (friendlies < 3 && this.frame % 120 === 0) {
                    const fb = new Bot(true);
                    fb.x = this.player.x;
                    fb.y = this.player.y;
                    this.ents.push(fb);
                }
                if (enemies < 4 && this.frame % 120 === 0) {
                    const eb = new Bot(false);
                    eb.x = Rnd(100, this.world - 100);
                    eb.y = Rnd(100, this.world - 100);
                    this.ents.push(eb);
                }
            } else if (this.ents.length === 0 && this.conf.mode !== 'train_defense' && this.conf.mode !== 'cyber_hack' && this.conf.mode !== 'escape' && this.conf.mode !== 'custom') this.over("VICTOIRE");

            this.player.update();
            if (this.player.hp < 1 && this.state === 'PLAYING') {
                this.player.hp = 0;
                this.over("ELIMINÉ");
            }
            if (this.train) {
                this.train.update();
                if (this.train.hp <= 0) this.over(this.conf.mode === 'payload' ? "CONVOI DÉTRUIT" : "TRAIN DÉTRUIT");
            }
            if (this.conf.mode === 'cyber_hack') {
                const term = this.ents.find(e => e.type === 'terminal');
                if (term) {
                    if (Dist(this.player, term) < 200) {
                        this.hackProgress += 0.05;
                        if (Math.random() < 0.1) this.parts.push({
                            x: term.x + Rnd(-20, 20),
                            y: term.y + Rnd(-20, 20),
                            vx: 0,
                            vy: -2,
                            life: 30,
                            c: '#22d3ee',
                            r: 2
                        });
                    }
                    if (this.hackProgress >= 100) this.over("VICTOIRE");
                }
            }
            if (this.conf.mode === 'thunder_capture' && this.thunderZone) {
                const tz = this.thunderZone;
                // Move Zone
                if (Math.hypot(tz.nx - tz.x, tz.ny - tz.y) < 20) {
                    // New random target in world bounds padding 200
                    tz.nx = 200 + Math.random() * (this.world - 400);
                    tz.ny = 200 + Math.random() * (this.world - 400);
                } else {
                    const a = Math.atan2(tz.ny - tz.y, tz.nx - tz.x);
                    tz.x += Math.cos(a) * 1.5;
                    tz.y += Math.sin(a) * 1.5;
                }

                // Check Progress
                if (Dist(this.player, tz) < tz.r) {
                    tz.progress += 0.08;
                    if (this.frame % 30 === 0) this.parts.push({
                        x: this.player.x + Rnd(-20, 20),
                        y: this.player.y + Rnd(-20, 20),
                        vx: 0,
                        vy: -2,
                        life: 30,
                        c: '#facc15',
                        r: 3,
                        shape: 'spark'
                    });
                } else {
                    // Optional: Decay? No, just stop.
                }
                if (tz.progress >= 100) this.over("VICTOIRE");
            }
            if (this.conf.mode === 'escape') {
                const exit = this.ents.find(e => e.type === 'exit');
                if (exit && Dist(this.player, exit) < exit.r + this.player.r) {
                    this.over("VICTOIRE");
                }
            }
            if (this.conf.mode === 'rampage') {
                if (this.killCount >= 50) this.over("VICTOIRE");
            }
            if (this.conf.mode === 'zone_control') {
                // Check if player is in center zone (radius 200)
                if (Dist(this.player, {
                        x: this.world / 2,
                        y: this.world / 2
                    }) < 200) {
                    this.zoneProgress += 0.1;
                    if (this.frame % 30 === 0) if(window.ui) window.ui.notif("CAPTURE...", "#a855f7");
                    if (this.zoneProgress >= 100) this.over("VICTOIRE");
                }
            }
            if (this.conf.mode === 'royale') {
                if (this.frame % 30 === 0 && this.gasRadius > 150) {
                    this.gasRadius -= 5;
                }
                const survivors = this.ents.filter(e => e.isBot && !e.dead).length;
                if (survivors === 0) this.over("TOP 1 - VICTOIRE ROYAL");

                // Gas visual effect
                if (this.frame % 20 === 0) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = this.gasRadius;
                    this.parts.push({
                        x: this.world / 2 + Math.cos(angle) * r,
                        y: this.world / 2 + Math.sin(angle) * r,
                        vx: 0,
                        vy: 0,
                        life: 60,
                        c: '#10b981',
                        r: 10
                    });
                }
            }

            // DECALS UPDATE
            if (this.decals) {
                for (let i = this.decals.length - 1; i >= 0; i--) {
                    const d = this.decals[i];
                    d.life--;
                    if (d.life <= 0) this.decals.splice(i, 1);
                }
            }

            this.ents.forEach(e => e.update());
            // Fix: Remove dead entities (e.g. from poison) that didn't go through kill()
            for (let e of this.ents) {
                if (e.hp <= 0 && !e.dead) this.kill(e);
            }

            this.ents.forEach(e => resolveCollision(this.player, e));
            for (let i = 0; i < this.ents.length; i++)
                for (let j = i + 1; j < this.ents.length; j++) resolveCollision(this.ents[i], this.ents[j]);

            // CAM FOLLOW
            let targetX = this.player.x,
                targetY = this.player.y;
            const tx = targetX - CFG.w / 2,
                ty = targetY - CFG.h / 2;
            this.cam.x += (tx - this.cam.x) * 0.1;
            this.cam.y += (ty - this.cam.y) * 0.1;
            this.cam.x = Math.max(0, Math.min(this.world - CFG.w, this.cam.x));
            this.cam.y = Math.max(0, Math.min(this.world - CFG.h, this.cam.y));
            if (this.shake > 0) this.shake *= 0.9;

            // PROJECTILES
            for (let i = this.projs.length - 1; i >= 0; i--) {
                const b = this.projs[i];

                // Melee attacks do not move
                if (b.melee) {
                    b.x = window.game.player.x + Math.cos(window.game.player.angle) * 40;
                    b.y = window.game.player.y + Math.sin(window.game.player.angle) * 40;
                    b.life--;

                    if (b.life <= 0) {
                        this.projs.splice(i, 1);
                        continue;
                    }

                    for (let e of this.ents)
                        if (Dist(b, e) < b.r + e.r && !e.hitCD) {
                            e.hitCD = 20;
                            e.hp -= b.dmg;
                            e.hitTimer = 0; // Reset hitTimer
                            if (b.friend) {
                                USER.stats.dmg += b.dmg;
                                QuestSystem.check('dmg', {
                                    amount: Math.floor(b.dmg)
                                });
                            }
                            if (window.game.conf.modifier === 'poison') e.activeEffects.poison = 120;

                            // Bot React Emote on Hit
                            if (e.isBot && Math.random() < 0.3) {
                                const angryEmotes = ['😡', '🤬', '😭', '💔', '😵', '🤕'];
                                e.triggerEmote(angryEmotes[Math.floor(Math.random() * angryEmotes.length)]);
                            }

                            // FIX: Lifesteal handled for melee
                            if (b.friend && (USER.selected === 'ronin' || USER.selected === 'reaper')) { // Ronin et Reaper ont le lifesteal
                                if (window.game.conf.modifier !== 'oneshot') window.game.player.hp = Math.min(window.game.player.maxHp, window.game.player.hp + Math.floor(b.dmg * 0.4));
                            }
                            if (window.game.conf.modifier === 'recoil' && b.friend) {
                                e.x += Math.cos(window.game.player.angle) * 20;
                                e.y += Math.sin(window.game.player.angle) * 20;
                            } // Knockback enemy

                            e.flashColor = b.c;
                            e.flashTimer = 5; // Flash Feedback
                            for (let k = 0; k < 7; k++) this.parts.push({
                                x: e.x,
                                y: e.y,
                                vx: Rnd(-3, 3),
                                vy: Rnd(-3, 3),
                                life: 15,
                                c: b.c,
                                r: Rnd(2, 4),
                                gravity: true,
                                shape: 'rect',
                                angle: Rnd(0, Math.PI),
                                vRot: Rnd(-0.2, 0.2)
                            }); // Debris
                            this.texts.push({
                                x: e.x,
                                y: e.y - 40,
                                t: Math.floor(b.dmg),
                                life: 50,
                                c: '#fff',
                                vy: -1.5,
                                scale: 1.5
                            });
                            if (window.game.conf.modifier === 'oneshot') e.hp = 0;
                            if (e.hp <= 0 && !e.dead) this.kill(e);
                        }
                    continue;
                }

                // Ranged attacks move
                const mod = (window.game.activeModifier || window.game.conf.modifier);
                const timeScale = mod === 'slow_mo' ? 0.5 : 1.0;
                b.x += b.vx * timeScale;
                b.y += b.vy * timeScale;
                b.life--;
                if (b.life <= 0) {
                    this.projs.splice(i, 1);
                    continue;
                }
                let wh = false;
                for (let k = this.map.length - 1; k >= 0; k--) {
                    const w = this.map[k];
                    if (w.type !== 1 && ColRect(b, w)) {
                        // FIX: Empêcher les projectiles de casser les murs (sauf les caisses de butin type 3)
                        if (w.type === 0) wh = true; // Mur normal

                        if (w.type === 3 && b.friend) { // Mur destructible par projectile joueur
                            this.map.splice(k, 1);
                            this.items.push({
                                x: w.x + 30,
                                y: w.y + 30,
                                type: 'cube'
                            });
                            for (let j = 0; j < 8; j++) this.parts.push({
                                x: w.x + 30,
                                y: w.y + 30,
                                vx: Rnd(-6, 6),
                                vy: Rnd(-6, 6),
                                life: 25,
                                c: '#d97706',
                                r: Rnd(4, 7),
                                shape: 'rect',
                                angle: Rnd(0, 6),
                                vRot: Rnd(-0.3, 0.3),
                                gravity: true
                            });
                            wh = true;
                        } else if (w.type === 3 && !b.friend) {
                            // Projectiles ennemis ne cassent pas les murs
                            wh = true;
                        }
                    }
                }
                if (wh) {
                    for (let j = 0; j < 3; j++) this.parts.push({
                        x: b.x,
                        y: b.y,
                        vx: (Math.random() - 0.5) * 3,
                        vy: (Math.random() - 0.5) * 3,
                        life: 10,
                        c: b.c,
                        r: 2
                    });
                    this.projs.splice(i, 1);
                    continue;
                }

                if (b.friend) {
                    for (let e of this.ents) {
                        if (Dist(b, e) < b.r + e.r) {
                            e.hp -= b.dmg;
                            e.hitTimer = 0; // Reset hitTimer
                            USER.stats.dmg += b.dmg;
                            QuestSystem.check('dmg', {
                                amount: Math.floor(b.dmg)
                            });

                            if (window.game.conf.modifier === 'poison') e.activeEffects.poison = 120;
                            // FIX: Lifesteal for ranged
                            if (window.game.conf.modifier === 'vampire' && window.game.conf.modifier !== 'oneshot') window.game.player.hp = Math.min(window.game.player.maxHp, window.game.player.hp + 5); // Life Steal (Vampire modifier)
                            if (window.game.conf.modifier === 'recoil') {
                                e.x += Math.cos(Math.atan2(b.vy, b.vx)) * 20;
                                e.y += Math.sin(Math.atan2(b.vy, b.vx)) * 20;
                            }

                            // Flash Feedback
                            e.flashColor = b.c;
                            e.flashTimer = 5;

                            // Bot React Emote on Hit
                            if (e.isBot && Math.random() < 0.3) {
                                const angryEmotes = ['😡', '🤬', '😭', '💔', '😵', '🤕'];
                                e.triggerEmote(angryEmotes[Math.floor(Math.random() * angryEmotes.length)]);
                            }

                            // Feature 6: Dégâts Critiques
                            const isCrit = b.isCrit;
                            this.texts.push({
                                x: e.x,
                                y: e.y - 40,
                                t: Math.floor(b.dmg) + (isCrit ? "!" : ""),
                                life: 50,
                                c: isCrit ? '#facc15' : '#fff',
                                vy: -2,
                                scale: isCrit ? 2 : 1.2
                            });
                            for (let k = 0; k < 8; k++) this.parts.push({
                                x: e.x,
                                y: e.y,
                                vx: Rnd(-5, 5),
                                vy: Rnd(-5, 5),
                                life: 20,
                                c: e.c,
                                r: 4,
                                gravity: true
                            });
                            if (window.game.conf.modifier === 'oneshot') e.hp = 0;
                            if (e.hp <= 0 && !e.dead) this.kill(e);
                            if (SoundManager) SoundManager.play('hit');
                            this.projs.splice(i, 1);
                            wh = true;
                            break;
                        }
                    }
                } else {
                    // Enemy projectiles hit player or TRAIN
                    let hit = false;
                    if (Dist(b, this.player) < b.r + this.player.r) {
                        this.player.hp -= b.dmg;
                        this.player.hitTimer = 0; // Reset hitTimer
                        if(window.ui) window.ui.flash();
                        if (window.game.conf.modifier === 'poison') this.player.activeEffects.poison = 120;
                        if (window.game.conf.modifier === 'oneshot') this.player.hp = 0;
                        if (this.player.hp < 1) {
                            this.player.hp = 0;
                            this.over("Tué par Tir Ennemi");
                        }
                        hit = true;
                    }
                    if (!hit && this.train && Dist(b, this.train) < b.r + this.train.r) {
                        this.train.hp -= b.dmg;
                        hit = true;
                    }
                    if (hit) this.projs.splice(i, 1);
                }
            }
            this.ents.forEach(e => {
                if (e.hitCD) e.hitCD--
            });
            for (let i = this.ents.length - 1; i >= 0; i--)
                if (this.ents[i].dead) this.ents.splice(i, 1);
            for (let i = this.items.length - 1; i >= 0; i--) {
                const l = this.items[i];
                // Feature 5: Ramassage Rapide (les items suivent le joueur)
                if (Dist(l, this.player) < 150) {
                    let angleToPlayer = Math.atan2(this.player.y - l.y, this.player.x - l.x);
                    l.x += Math.cos(angleToPlayer) * 5;
                    l.y += Math.sin(angleToPlayer) * 5;
                }

                if (Dist(l, this.player) < 30) {
                    if (l.type === 'cube') {
                        if (SoundManager) SoundManager.play('collect');
                        this.player.cubes++;
                        this.player.maxHp += 400;
                        this.player.hp += 400;
                        if(window.ui) window.ui.notif("POWER UP!", "#22c55e");
                    }
                    if (l.type === 'loot_bag') {
                        this.lootCollected++;
                        QuestSystem.check('collect', {
                            itemType: 'loot_bag',
                            amount: 1
                        });
                        if (SoundManager) SoundManager.play('collect');
                        if(window.ui) window.ui.notif(`SAC RÉCUPÉRÉ (${this.lootCollected}/10)`, "#facc15");
                        if (this.lootCollected >= 10) this.over("VICTOIRE");
                    } else {
                        if (SoundManager) SoundManager.play('collect');
                        QuestSystem.check('collect', {
                            itemType: l.t,
                            amount: 1
                        });
                        if (l.t === 'hp') {
                            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
                            for (let j = 0; j < 6; j++) this.parts.push({
                                x: l.x,
                                y: l.y,
                                vx: Rnd(-3, 3),
                                vy: Rnd(-3, 3),
                                life: 20,
                                c: '#22c55e',
                                r: 3,
                                shape: 'spark',
                                angle: Rnd(0, 6),
                                vRot: Rnd(-0.1, 0.1)
                            }); // VFX
                        } else if (l.t === 'coins') {
                            USER.coins += 10;
                            if(window.ui) window.ui.feed("Pièces", "+10 🪙", true);
                            for (let j = 0; j < 6; j++) this.parts.push({
                                x: l.x,
                                y: l.y,
                                vx: Rnd(-3, 3),
                                vy: Rnd(-3, 3),
                                life: 20,
                                c: '#eab308',
                                r: 3,
                                shape: 'spark',
                                angle: Rnd(0, 6),
                                vRot: Rnd(-0.1, 0.1)
                            });
                        } else if (l.t === 'gems') {
                            USER.gems += 1;
                            if(window.ui) window.ui.feed("Gemme", "+1 💎", true);
                            for (let j = 0; j < 6; j++) this.parts.push({
                                x: l.x,
                                y: l.y,
                                vx: Rnd(-3, 3),
                                vy: Rnd(-3, 3),
                                life: 20,
                                c: '#a855f7',
                                r: 3,
                                shape: 'spark',
                                angle: Rnd(0, 6),
                                vRot: Rnd(-0.1, 0.1)
                            });
                        } else {
                            // xp
                            this.player.xp = Math.min(this.player.xpMax - 1, this.player.xp + 30);
                            QuestSystem.check('xp', {
                                amount: 30
                            });
                            for (let j = 0; j < 6; j++) this.parts.push({
                                x: l.x,
                                y: l.y,
                                vx: Rnd(-3, 3),
                                vy: Rnd(-3, 3),
                                life: 20,
                                c: '#a855f7',
                                r: 3,
                                shape: 'spark',
                                angle: Rnd(0, 6),
                                vRot: Rnd(-0.1, 0.1)
                            });
                        }
                    }
                    this.items.splice(i, 1);
                }
            }
            for (let i = this.parts.length - 1; i >= 0; i--) {
                const p = this.parts[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.vRot) p.angle = (p.angle || 0) + p.vRot; // Rotation update
                p.vx *= (p.friction || 0.92);
                p.vy *= (p.friction || 0.92); // Friction
                if (p.gravity) p.vy += 0.25; // Good gravity
                if (p.shape === 'shell') {
                    p.vx *= 0.9;
                    p.vy *= 0.9;
                } // Stop shells faster
                p.life--;
                if (p.decay) p.r *= p.decay;
                else p.r = Math.max(0.1, p.r * 0.95); // Shrink
                if (p.life <= 0 || p.r < 0.2) this.parts.splice(i, 1);
            }
            if(window.ui) window.ui.hud();
            if(window.ui) window.ui.drawMinimap();
        }
        const map = ARENAS[this.conf.arena];
        ctx.fillStyle = map.color;
        ctx.fillRect(0, 0, CFG.w, CFG.h);
        ctx.save();
        if (this.state !== 'MENU') {
            const sx = (Math.random() - 0.5) * this.shake,
                sy = (Math.random() - 0.5) * this.shake;
            ctx.translate(-this.cam.x + sx, -this.cam.y + sy);

            // RENDER DECALS (FOOTPRINTS & BLOOD)
            if (this.decals) {
                this.decals.forEach(d => {
                    // Culling
                    if (d.x < this.cam.x - 50 || d.x > this.cam.x + CFG.w + 50 || d.y < this.cam.y - 50 || d.y > this.cam.y + CFG.h + 50) return;

                    ctx.save();
                    ctx.translate(d.x, d.y);
                    if (d.angle) ctx.rotate(d.angle);
                    ctx.globalAlpha = Math.min(1, d.life / 100);

                    if (d.type === 'footprint') {
                        ctx.fillStyle = 'rgba(0,0,0,0.2)';
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 4, 8, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (d.type === 'blood') {
                        ctx.fillStyle = d.c || '#7f1d1d';
                        ctx.beginPath();
                        ctx.arc(0, 0, d.r, 0, Math.PI * 2);
                        ctx.fill();
                        if (d.details) {
                            d.details.forEach(det => {
                                ctx.beginPath();
                                ctx.arc(det.x, det.y, det.r, 0, Math.PI * 2);
                                ctx.fill();
                            });
                        }
                    }
                    ctx.restore();
                });
            }

            this.drawTerrainEffects();
            ctx.strokeStyle = map.grid;
            ctx.lineWidth = 2;
            const tx = Math.floor(this.cam.x / 100) * 100,
                ty = Math.floor(this.cam.y / 100) * 100;
            ctx.beginPath();
            for (let x = tx; x < tx + CFG.w + 100; x += 100) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.world);
            }
            for (let y = ty; y < ty + CFG.h + 100; y += 100) {
                ctx.moveTo(0, y);
                ctx.lineTo(this.world, y);
            }
            ctx.stroke();
            if (this.conf.mode === 'heist') {
                const chest = this.ents.find(e => e.type === 'chest');
                if (chest) {
                    const angle = Math.atan2(chest.y - this.player.y, chest.x - this.player.x);
                    ctx.save();
                    ctx.translate(this.player.x, this.player.y);
                    ctx.rotate(angle);
                    ctx.fillStyle = '#facc15';
                    ctx.beginPath();
                    ctx.moveTo(60, 0);
                    ctx.lineTo(50, -10);
                    ctx.lineTo(50, 10);
                    ctx.fill();
                    ctx.restore();
                }
            } else if (this.conf.mode === 'train_defense' && this.train) {
                const angle = Math.atan2(this.train.y - this.player.y, this.train.x - this.player.x);
                ctx.save();
                ctx.translate(this.player.x, this.player.y);
                ctx.rotate(angle);
                ctx.fillStyle = '#3b82f6';
                ctx.beginPath();
                ctx.moveTo(60, 0);
                ctx.lineTo(50, -10);
                ctx.lineTo(50, 10);
                ctx.fill();
                ctx.restore();
            } else if (this.conf.mode === 'payload' && this.train) {
                const angle = Math.atan2(this.train.y - this.player.y, this.train.x - this.player.x);
                ctx.save();
                ctx.translate(this.player.x, this.player.y);
                ctx.rotate(angle);
                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                ctx.moveTo(60, 0);
                ctx.lineTo(50, -10);
                ctx.lineTo(50, 10);
                ctx.fill();
                ctx.restore();
            } else if (this.conf.mode === 'cyber_hack') {
                const term = this.ents.find(e => e.type === 'terminal');
                if (term) {
                    ctx.save();
                    ctx.translate(term.x, term.y);
                    ctx.fillStyle = `rgba(34, 211, 238, 0.3)`;
                    ctx.beginPath();
                    ctx.arc(0, 0, 200, 0, Math.PI * 2);
                    ctx.fill(); // Zone
                    ctx.fillStyle = '#22d3ee';
                    ctx.fillRect(-20, -20, 40, 40); // Terminal
                    ctx.fillStyle = 'white';
                    ctx.font = "bold 20px Orbitron";
                    ctx.textAlign = 'center';
                    ctx.fillText(Math.floor(this.hackProgress) + "%", 0, -40);
                    ctx.restore();
                }
            } else if (this.conf.mode === 'escape') {
                const exit = this.ents.find(e => e.type === 'exit');
                if (exit) {
                    ctx.save();
                    ctx.translate(exit.x, exit.y);
                    ctx.fillStyle = `rgba(16, 185, 129, 0.3)`;
                    ctx.beginPath();
                    ctx.arc(0, 0, 100 + Math.sin(this.frame * 0.1) * 20, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#10b981';
                    ctx.font = "bold 30px Orbitron";
                    ctx.textAlign = 'center';
                    ctx.fillText("EXIT", 0, -40);
                    ctx.restore();
                }
            } else if (this.conf.mode === 'thunder_capture' && this.thunderZone) {
                const tz = this.thunderZone;
                ctx.save();
                ctx.translate(tz.x, tz.y);

                // Pulse Effect
                const pulse = Math.sin(this.frame * 0.1) * 10;

                ctx.beginPath();
                ctx.arc(0, 0, tz.r + pulse, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(250, 204, 21, 0.15)`;
                ctx.fill();
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Moving inner ring
                ctx.beginPath();
                ctx.arc(0, 0, tz.r * 0.8, this.frame * 0.02, this.frame * 0.02 + Math.PI);
                ctx.strokeStyle = `rgba(250, 204, 21, 0.4)`;
                ctx.lineWidth = 10;
                ctx.stroke();

                // Progress Arc
                ctx.beginPath();
                ctx.arc(0, 0, tz.r, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * (tz.progress / 100)));
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 8;
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = "bold 30px Orbitron";
                ctx.textAlign = 'center';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 5;
                ctx.fillText(Math.floor(tz.progress) + "%", 0, 0);
                ctx.restore();
            } else if (this.conf.mode === 'royale') {
                ctx.save();
                ctx.translate(this.world / 2, this.world / 2);
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, this.gasRadius), 0, Math.PI * 2);
                ctx.stroke();
                // Gas overlay outside
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, this.gasRadius), 0, Math.PI * 2);
                ctx.rect(this.world, -this.world, -this.world * 2, this.world * 2); // Inverse clip hack? No, simpler just draw giant ring
                // Better: Draw full green screen with globalCompositeOperation but that's complex here.
                // Just draw the circle limit.
                ctx.restore();
            } else if (this.conf.mode === 'zone_control') {
                ctx.save();
                ctx.translate(this.world / 2, this.world / 2);
                ctx.fillStyle = `rgba(168, 85, 247, 0.2)`;
                ctx.beginPath();
                ctx.arc(0, 0, 200, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 200 * (this.zoneProgress / 100), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(168, 85, 247, 0.5)`;
                ctx.fill();
                ctx.restore();
            }
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 5;
            ctx.strokeRect(0, 0, this.world, this.world);
            this.items.forEach(l => {
                if (l.type === 'cube') {
                    ctx.fillStyle = '#22c55e';
                    ctx.fillRect(l.x - 10, l.y - 10, 20, 20);
                    ctx.shadowColor = '#22c55e';
                    ctx.shadowBlur = 10;
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(l.x - 10, l.y - 10, 20, 20);
                    ctx.shadowBlur = 0;
                } else if (l.type === 'loot_bag') {
                    ctx.fillStyle = '#facc15';
                    ctx.font = '30px Arial';
                    ctx.fillText('💰', l.x - 15, l.y + 10);
                } else {
                    ctx.fillStyle = l.t === 'hp' ? '#22c55e' : '#a855f7';
                    ctx.beginPath();
                    ctx.arc(l.x, l.y, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            const renderList = [...this.map, ...this.ents, this.player, ...this.projs, ...this.parts];
            renderList.sort((a, b) => a.y - b.y);
            renderList.forEach(o => {
                if (o instanceof Wall) o.draw(ctx, map.wall);
                else if (o.draw) o.draw(ctx);
                else {
                    ctx.fillStyle = o.c;
                    if (o.isRect || o.shape === 'rect') {
                        ctx.save();
                        ctx.translate(o.x, o.y);
                        if (o.angle) ctx.rotate(o.angle);
                        ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2);
                        ctx.restore();
                    } else if (o.shape === 'spark') {
                        ctx.save();
                        ctx.translate(o.x, o.y);
                        if (o.angle) ctx.rotate(o.angle);
                        ctx.beginPath();
                        ctx.moveTo(0, -o.r * 1.5);
                        ctx.lineTo(o.r / 2, 0);
                        ctx.lineTo(0, o.r * 1.5);
                        ctx.lineTo(-o.r / 2, 0);
                        ctx.fill();
                        ctx.restore();
                    } else if (o.shape === 'shell') {
                        ctx.save();
                        ctx.translate(o.x, o.y);
                        if (o.angle) ctx.rotate(o.angle);
                        ctx.fillStyle = '#facc15';
                        ctx.fillRect(-1.5, -3, 3, 6);
                        ctx.restore();
                    } else if (o.shape === 'shockwave') {
                        ctx.save();
                        ctx.translate(o.x, o.y);
                        ctx.beginPath();
                        ctx.arc(0, 0, o.r, 0, Math.PI * 2);
                        ctx.strokeStyle = o.c;
                        ctx.lineWidth = Math.max(0.5, (o.life / 10) * 3);
                        ctx.globalAlpha = o.life / 20;
                        ctx.stroke();
                        ctx.restore();
                        ctx.globalAlpha = 1;
                    } else if (o.shape === 'smoke') {
                        ctx.globalAlpha = o.life / 60; // Soft Fade
                        ctx.beginPath();
                        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
                        ctx.fillStyle = o.c;
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    } else {
                        ctx.beginPath();
                        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });

            // RENDU DES PROJECTILES UNIQUES
            this.projs.forEach(p => {
                // Traînée
                // Traînée & Fumée de projectile
                if (p.trailColor && this.frame % 2 === 0 && !p.melee) {
                    this.parts.push({
                        x: p.x,
                        y: p.y,
                        vx: -p.vx * 0.05,
                        vy: -p.vy * 0.05,
                        life: 15,
                        c: p.trailColor,
                        r: p.r / 2.5,
                        shape: 'smoke',
                        decay: 0.9
                    });
                }

                ctx.shadowColor = p.c;
                ctx.shadowBlur = 15; // Increased glow for realism
                ctx.fillStyle = p.c;

                // Dessin par forme
                if (p.shape === 'rock') {
                    ctx.font = `${p.r * 1.5}px Arial`;
                    ctx.fillText("🗿", p.x - p.r, p.y + p.r / 2);
                } else if (p.shape === 'snake') {
                    ctx.font = `${p.r * 2}px Arial`;
                    ctx.fillText("🐍", p.x - p.r, p.y + p.r / 2);
                } else if (p.shape === 'flame') {
                    ctx.font = `${p.r * 1.5}px Arial`;
                    ctx.fillText("🔥", p.x - p.r, p.y + p.r / 2);
                } else if (p.shape === 'shark') {
                    ctx.font = `${p.r * 2}px Arial`;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(Math.atan2(p.vy, p.vx));
                    ctx.fillText("🦈", -p.r, p.r / 2);
                    ctx.restore();
                } else if (p.shape === 'arrow') {
                    ctx.font = `${p.r * 2}px Arial`;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2); // Rotation 90deg for arrow
                    ctx.fillText("🏹", -p.r, p.r / 2);
                    ctx.restore();
                } else if (p.shape === 'sniper') {
                    ctx.fillStyle = p.c;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                    // Crosshair effect
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x - p.r * 1.5, p.y);
                    ctx.lineTo(p.x + p.r * 1.5, p.y);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y - p.r * 1.5);
                    ctx.lineTo(p.x, p.y + p.r * 1.5);
                    ctx.stroke();
                } else if (p.shape === 'cross') {
                    ctx.font = `${p.r * 2}px Arial`;
                    ctx.fillText("✚", p.x - p.r, p.y + p.r / 2);
                } else if (p.shape === 'paw') {
                    ctx.font = `${p.r * 1.5}px Arial`;
                    ctx.fillText("🐾", p.x - p.r, p.y + p.r / 2);
                } else if (p.shape === 'melee') {
                    // Melee est un simple arc très rapide pour simuler un coup
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(this.player.angle);
                    ctx.fillStyle = p.c;
                    ctx.globalAlpha = 0.8 * (p.life / 1); // Disparaît immédiatement
                    ctx.beginPath();
                    ctx.arc(0, 0, p.r, -0.5, 0.5); // Arc devant le joueur
                    ctx.lineTo(0, 0);
                    ctx.fill();
                    ctx.restore();
                } else {
                    // Projectile standard (cercle/laser)
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.shadowBlur = 0;
            });
            this.texts.forEach((t, i) => {
                t.y += t.vy;
                t.life--;
                t.vy *= 0.95; // Float slowing down

                ctx.save();
                ctx.translate(t.x, t.y);
                // Scale In/Out effect
                const maxLife = 50;
                let s = t.scale || 1;
                const age = maxLife - t.life;
                if (age < 10) s = s * Math.sin((age / 10) * (Math.PI / 2)); // Smooth pop in
                if (t.life < 10) {
                    ctx.globalAlpha = t.life / 10;
                    s *= 0.9;
                    t.y -= 1;
                }

                ctx.scale(s, s);
                ctx.fillStyle = 'black';
                ctx.lineWidth = 3;
                ctx.strokeText(t.t, 0, 0); // Outline for better visibility
                ctx.fillStyle = t.c;
                ctx.font = "900 24px 'Orbitron', 'Arial Black', sans-serif";
                ctx.textAlign = 'center';
                ctx.fillText(t.t, 0, 0);
                ctx.restore();
                ctx.globalAlpha = 1;
                if (t.life <= 0) this.texts.splice(i, 1);
            });
        }
        ctx.restore();
    },

    kill(e) {
        e.dead = true;

        // Realism: Blood Decal & Gore Explosion
        if (!e.type || e.type.match(/basic|fast|tank|boss|mini_boss/) || e instanceof Player) {
            if (this.decals) {
                this.decals.push({
                    x: e.x,
                    y: e.y,
                    type: 'blood',
                    r: e.r || 20,
                    life: 1200,
                    c: '#7f1d1d',
                    details: Array.from({
                        length: 8
                    }, () => ({
                        x: Rnd(-20, 20),
                        y: Rnd(-20, 20),
                        r: Rnd(3, 8)
                    }))
                });
            }
            // Gore particles vs normal debris
            for (let i = 0; i < 6; i++) {
                this.parts.push({
                    x: e.x,
                    y: e.y,
                    vx: Rnd(-4, 4),
                    vy: Rnd(-4, 4),
                    life: 40,
                    c: e.c,
                    r: Rnd(3, 6),
                    gravity: true,
                    shape: 'rect',
                    angle: Rnd(0, 6),
                    vRot: Rnd(-0.5, 0.5)
                });
            }
            // Blood mist
            for (let i = 0; i < 5; i++) {
                this.parts.push({
                    x: e.x,
                    y: e.y,
                    vx: Rnd(-1, 1),
                    vy: Rnd(-1, 1),
                    life: 60,
                    c: '#991b1b',
                    r: Rnd(5, 15),
                    shape: 'smoke',
                    decay: 1.05
                });
            }
        }

        // Realism: Death Shockwave
        this.parts.push({
            x: e.x,
            y: e.y,
            vx: 0,
            vy: 0,
            life: 15,
            c: 'white',
            r: 10,
            shape: 'shockwave',
            decay: 1.25
        });

        // STREAK LOGIC
        const now = Date.now();
        if (now - (this.lastKillTime || 0) < 4000) { // 4 seconds window for streak
            this.killStreak++;
        } else {
            this.killStreak = 1;
        }
        this.lastKillTime = now;

        if (this.killStreak >= 2) {
            if(window.ui) window.ui.showStreak(this.killStreak);
        }

        const diffMult = DIFFICULTY[this.conf.difficulty].mult;
        this.score += (e.isBoss || e.isBot ? 500 : 100) * diffMult;
        this.player.xp = Math.min(this.player.xpMax - 1, this.player.xp + (e.isBoss ? 300 : 20) * diffMult);
        this.player.super = Math.min(100, this.player.super + (e.isBoss ? 30 : 10));

        if (this.player.stats.passive === "Vol de Vie" && this.player.stats.type !== 'melee') {
            if (this.conf.modifier !== 'oneshot') this.player.hp = Math.min(this.player.maxHp, this.player.hp + (e.isBoss ? 50 : 10)); // Heal on kill for ranged lifesteal
        }

        // Bot Death Emote (Spawns floating text)
        if (e.isBot && Math.random() < 0.5) {
            const sadEmotes = ['💀', '😭', '💔', '😵', '🏳️', '👻'];
            const em = sadEmotes[Math.floor(Math.random() * sadEmotes.length)];
            this.texts.push({
                x: e.x,
                y: e.y - 50,
                t: em,
                life: 80,
                c: '#fff',
                vy: -1,
                scale: 2
            });
        }

        // EXPLOSIVE MOD
        if (this.conf.modifier === 'explosive' || this.activeModifier === 'explosive') {
            for (let i = 0; i < 8; i++) {
                this.parts.push({
                    x: e.x,
                    y: e.y,
                    vx: Rnd(-5, 5),
                    vy: Rnd(-5, 5),
                    life: 30,
                    c: '#f97316',
                    r: 6
                });
            }
            if (Dist(e, this.player) < 100) {
                this.player.hp -= 50;
                if(window.ui) window.ui.flash();
                if (this.player.hp < 1) {
                    this.player.hp = 0;
                    this.over("Tué par Explosion");
                }
            }
        }

        if (this.conf.mode === 'golden_chase' && Math.random() < 0.6) {
            this.items.push({
                x: e.x,
                y: e.y,
                t: 'coins'
            });
        }

        if (Math.random() < 0.3) {
            const r = Math.random();
            let t = 'xp';
            if (r < 0.35) t = 'hp';
            else if (r < 0.7) t = 'xp';
            else if (r < 0.95) t = 'coins';
            else t = 'gems';

            this.items.push({
                x: e.x,
                y: e.y,
                t: t
            });
        }
        // Manual check for 'collect' logic if we want "enemies drop X" or similar, but 'collect' is on pickup.
        // However, coins and gems from box:

        USER.stats.kills++;
        this.killCount++;
        QuestSystem.check('kill', {}); // Quest Check
        if(window.ui) window.ui.feed("Toi", e.isBot ? "Rival" : (e.type === 'chest' ? "COFFRE" : e.name), true);
        if (this.player.xp >= this.player.xpMax) {
            this.player.xp = 0;
            this.player.xpMax *= 1.2;
            this.player.lvl++;
            this.player.hp = this.player.maxHp;
            this.state = 'LEVELUP';
            if(window.ui) window.ui.levelUp();
        }
        if (this.conf.mode === 'team_battle') {
            if (!e.friend) this.teamScore++;
            else this.enemyScore++;
            // Win Condition: 40 Kills
            if (this.teamScore >= 40) this.over("VICTOIRE");
            else if (this.enemyScore >= 40) this.over("DÉFAITE");
        }


        if (this.conf.mode === 'heist' && e.type === 'chest') this.over("VICTOIRE");
        if (this.conf.mode === 'defense' && e.type === 'core') this.over("DÉFAITE");
        if (this.conf.mode === 'boss_rush' && e.isBoss) {
            this.bossKills = (this.bossKills || 0) + 1;
            if (this.bossKills >= 3) this.over("VICTOIRE");
            else {
                const newBoss = new Enemy('boss', 3 + this.bossKills);
                this.ents.push(newBoss);
                if(window.ui) window.ui.notif("BOSS SUIVANT !", "#ef4444");
            }
        }
        if (this.conf.mode === 'titan_raid' && e.isBoss) {
            this.bossKills = (this.bossKills || 0) + 1;
            if (this.bossKills >= 5) this.over("VICTOIRE");
        }
    }
};
