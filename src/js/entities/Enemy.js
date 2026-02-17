import { Entity } from './Entity.js';
import { DIFFICULTY, SPEED_FACTOR, RATE_FACTOR, ENEMY_HP_BUFF } from '../data/constants.js';
import { Rnd, Dist, ColRect } from '../core/Utils.js';

export class Enemy extends Entity {
    constructor(t, m = 1) {
        const diffMult = DIFFICULTY[window.game.conf.difficulty].mult;
        const enemyMult = m * diffMult;
        super(0, 0, 20, '#ef4444');
        let safe = false;
        while (!safe) {
            this.x = Rnd(100, window.game.world - 100);
            this.y = Rnd(100, window.game.world - 100);
            let wallCol = false;
            for (let w of window.game.map) {
                if (w.type !== 1 && w.collide({
                        x: this.x,
                        y: this.y,
                        r: this.r
                    })) wallCol = true;
            }
            if (!wallCol && Dist(this, window.game.player) > 600) safe = true;
        }
        this.type = t;
        this.friend = false;
        let hp = 60,
            s = 2.0,
            dmg = 1;
        // Vitesse des ennemis ajustée par le facteur global
        s = s * SPEED_FACTOR;

        // Feature 1: Mini-Boss stats pour vagues 3 et 6
        if (t === 'fast') {
            hp = 40;
            s = 4.0 * SPEED_FACTOR;
            this.c = '#f97316';
            this.r = 15;
        }
        if (t === 'tank') {
            hp = 200;
            s = 1.2 * SPEED_FACTOR;
            this.c = '#7e22ce';
            this.r = 30;
        }
        if (t === 'mini_boss') {
            hp = 1000;
            s = 2.5 * SPEED_FACTOR;
            this.c = '#facc15';
            this.r = 40;
            this.isBoss = true;
            this.cd = Math.ceil(100 * RATE_FACTOR);
            dmg = 2;
            this.name = "MINI BOSS";
        }
        if (t === 'boss') {
            hp = 5000;
            s = 1.5 * SPEED_FACTOR;
            this.c = '#dc2626';
            this.r = 60;
            this.isBoss = true;
            this.cd = Math.ceil(0 * RATE_FACTOR);
            dmg = 3;
        }
        if (t === 'chest') {
            hp = 5000;
            s = 0;
            this.c = '#facc15';
            this.r = 40;
            this.isBoss = true;
        }
        if (t === 'train') {
            hp = 10000;
            s = 1.0 * SPEED_FACTOR;
            this.c = '#3b82f6';
            this.r = 30;
            this.type = 'train';
        }
        if (t === 'terminal') {
            hp = 5000;
            s = 0;
            this.c = '#22d3ee';
            this.r = 40;
            this.type = 'terminal';
        }

        // AJOUT: +20PV de base aux ennemis/bots
        hp += ENEMY_HP_BUFF;

        if (window.game.conf.modifier === 'giant') {
            this.r *= 2;
            hp *= 2;
            s *= 0.8;
        }
        if (window.game.conf.modifier === 'oneshot') {
            hp = 1;
        }

        this.hp = hp * enemyMult;

        // Apply Speed Scaling specifically for difficulty
        const diffSpeedMult = 1 + (diffMult - 1) * 0.3;

        this.maxHp = this.hp;
        this.spd = s * 0.85 * diffSpeedMult;
        this.baseDmg = dmg * enemyMult;
        // Application du facteur de tir sur le CD
        this.cd = Math.ceil((100 + Math.random() * 100) * RATE_FACTOR);

        if (this.isBoss) this.name = t === 'boss' ? 'BOSS' : (t === 'mini_boss' ? 'MINI BOSS' : (t === 'chest' ? 'COFFRE' : t.toUpperCase()));
        else this.name = `Bot n°${Math.floor(Math.random() * 89999) + 10000}`;
        this.activeEffects = {};
        this.isStunned = 0; // Ajout du stun
        this.flashTimer = 0; // Timer pour le flash de dégât
        this.flashColor = null; // Couleur du flash
        this.hitTimer = 300; // FIX 2: Timer de régénération
    }
    update() {
        if (this.isStunned > 0) {
            this.isStunned--;
            return;
        } // Stunned = skip update
        this.hitTimer++; // Incrémenter le timer de non-hit

        if (this.spd === 0) return;
        const p = window.game.player;
        let sepX = 0,
            sepY = 0;
        for (let other of window.game.ents) {
            if (other !== this) {
                let d = Dist(this, other);
                if (d < this.r * 2.5 && d > 0) {
                    let ang = Math.atan2(this.y - other.y, this.x - other.x);
                    sepX += Math.cos(ang);
                    sepY += Math.sin(ang);
                }
            }
        }

        if (this.type === 'basic' || this.type === 'fast' || this.type === 'tank' || this.type === 'mini_boss') {
            if (this.cd > 0) this.cd--;
            // IA 2.0 : Attaque les ennemis proches s'ils sont à portée
            if (this.cd <= 0 && Dist(this, p) < 400) {
                const a = Math.atan2(p.y - this.y, p.x - this.x);
                window.game.projs.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(a) * 3 * 1.08,
                    vy: Math.sin(a) * 3 * 1.08,
                    dmg: 10 * DIFFICULTY[window.game.conf.difficulty].mult,
                    life: 100,
                    r: 6,
                    c: this.c,
                    friend: false,
                    shape: 'circle',
                    trailColor: this.c
                });
                this.cd = Math.ceil(150 * RATE_FACTOR);
            }
        }

        if (this.type === 'boss' || this.type === 'mini_boss') {
            const d = Dist(this, p);
            const a = Math.atan2(p.y - this.y, p.x - this.x);
            // Boss Movement with Slow Mo Support
            let bossSpd = this.spd;
            const mod = (window.game.activeModifier || window.game.conf.modifier);
            if (mod === 'speed') bossSpd *= 2;
            if (mod === 'slow_mo') bossSpd *= 0.5;

            this.x += Math.cos(a) * bossSpd;
            this.y += Math.sin(a) * bossSpd;
            if (this.cd > 0) this.cd--;
            if (this.cd <= 0 && d < 800) {
                this.cd = Math.ceil(60 * RATE_FACTOR);
                window.game.projs.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(a) * 2.5 * 1.08,
                    vy: Math.sin(a) * 2.5 * 1.08,
                    dmg: 40 * DIFFICULTY[window.game.conf.difficulty].mult,
                    life: 200,
                    r: 20,
                    c: '#ef4444',
                    friend: false,
                    shape: 'circle',
                    trailColor: '#dc2626'
                });
            }
        } else {
            let playerHidden = false;
            // Fix Vision
            const distV = Math.hypot(p.x - this.x, p.y - this.y);
            const stepsV = Math.min(10, Math.floor(distV / 50));
            for (let i = 1; i < stepsV; i++) {
                const cx = this.x + (p.x - this.x) * (i / stepsV);
                const cy = this.y + (p.y - this.y) * (i / stepsV);
                for (let w of window.game.map) {
                    if (w.type !== 1 && ColRect({
                            x: cx,
                            y: cy,
                            r: 5
                        }, w)) {
                        playerHidden = true;
                        break;
                    }
                }
                if (playerHidden) break;
            }
            if (window.game.player.invisible > 0) playerHidden = true; // Enemy can't see invisible player

            let tx, ty;
            if (playerHidden && Dist(this, p) > 150) {
                if (!this.target || Dist(this, this.target) < 50 || Math.random() < 0.01) this.target = {
                    x: Rnd(100, window.game.world - 100),
                    y: Rnd(100, window.game.world - 100)
                };
                tx = this.target.x;
                ty = this.target.y;
            } else {
                tx = p.x;
                ty = p.y;
            }
            const a = Math.atan2(ty - this.y, tx - this.x);
            let speed = this.spd;
            const mod = (window.game.activeModifier || window.game.conf.modifier);
            if (mod === 'speed') speed *= 2;
            if (mod === 'slow_mo') speed *= 0.5;
            let mx = Math.cos(a) * speed + sepX * 0.5;
            let my = Math.sin(a) * speed + sepY * 0.5;
            const nx = this.x + mx,
                ny = this.y + my;
            let cx = false,
                cy = false;
            for (let w of window.game.map) {
                if (w.type === 1) continue;
                if (w.collide({
                        x: nx,
                        y: this.y,
                        r: this.r
                    })) cx = true;
                if (w.collide({
                        x: this.x,
                        y: ny,
                        r: this.r
                    })) cy = true;
            }
            if (!cx) this.x = nx;
            if (!cy) this.y = ny;
        }
        if (Math.hypot(this.x - p.x, this.y - p.y) < this.r + p.r) {
            let dmg = this.baseDmg;
            if (window.game.conf.modifier === 'fragile') dmg *= 2; // Fragile = Double Dégâts subis
            p.hp -= dmg;
            p.hitTimer = 0;
            if(window.ui) window.ui.flash();
            if (window.game.conf.modifier === 'oneshot') p.hp = 0;
            if (p.hp < 1) {
                p.hp = 0;
                window.game.over("Tué par " + this.name);
            }
        }
        if (this.activeEffects.poison > 0) {
            this.hp -= 1;
            this.activeEffects.poison--;
            this.hitTimer = 0;
        }

        // FIX 2: Régénération HP après 5s sans dégâts
        if (window.game.frame % 60 === 0 && this.hp < this.maxHp && this.hitTimer > 300 && window.game.conf.modifier !== 'oneshot') this.hp += Math.max(1, Math.floor(this.maxHp * 0.01));

        if (this.flashTimer > 0) this.flashTimer--;
    }
    draw(ctx) {
        if (this.flashTimer > 0 && this.flashColor) {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = this.flashColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.isBoss) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r + 5, 0, Math.PI * 2);
            ctx.strokeStyle = this.type === 'chest' ? '#facc15' : '#ef4444';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        super.draw(ctx);
        const pct = this.hp / this.maxHp;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - 20, this.y - this.r - 15, 40, 6);
        ctx.fillStyle = this.isBoss ? '#ef4444' : '#22c55e';

        // Si le bot est stun, couleur de la barre de vie en jaune
        if (this.isStunned > 0) ctx.fillStyle = '#facc15';

        ctx.fillRect(this.x - 19, this.y - this.r - 14, 38 * pct, 4);
        ctx.restore();
    }
}
