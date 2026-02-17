import { Entity } from './Entity.js';
import { Turret } from './Turret.js';
import { USER } from '../core/State.js';
import { Input } from '../core/Input.js';
import { SoundManager } from '../core/SoundManager.js';
import { STARTERS } from '../data/heroes.js';
import { Rnd, Dist } from '../core/Utils.js';
import { SPEED_FACTOR, RATE_FACTOR, RELOAD_FACTOR, PROJ_SPEED_FACTOR } from '../data/constants.js';

export class Player extends Entity {
    constructor(k) {
        const s = STARTERS[k];
        const l = (USER.levels[k] || 1) - 1;
        let c = s.color;
        if (USER.skins && USER.skins[k]) {
            const skinId = USER.skins[k];
            const heroSkinList = STARTERS[k]?.skins;
            if (skinId !== 'default' && heroSkinList) {
                const skinObj = heroSkinList.find(sk => sk.id === skinId);
                if (skinObj) c = skinObj.c;
            }
        }
        super(window.game.world / 2, window.game.world / 2, 20, c);
        this.stats = { ...s };
        this.stats.hp += s.scale.hp * l;
        this.stats.dmg += s.scale.dmg * l;
        // PV ne peuvent pas être négatifs à l'init
        this.hp = this.stats.hp;
        this.maxHp = this.stats.hp;
        this.xp = 0;
        this.xpMax = 100;
        this.lvl = 1;
        this.super = 0;
        this.cd = 0;
        this.dashT = 0;
        this.angle = 0;
        this.recoilOffset = 0;
        this.friend = true;
        this.ammo = s.ammo;
        this.ammoMax = s.ammo;
        this.reloadT = 0;
        this.gadgetCharges = 3;
        this.cubes = 0;
        this.activeEffects = {};
        this.isStunned = 0;
        this.passiveTimer = 0; // Timer pour les passifs périodiques (Shaman)
        this.hitTimer = 300;

        if (window.game.conf.modifier === 'giant') {
            this.r *= 2;
            this.maxHp *= 2;
            this.hp *= 2;
        }
        if (window.game.conf.modifier === 'oneshot') {
            this.hp = 1;
            this.maxHp = 1;
        } // Force One Shot HP
        this.invisible = 0; // New Invisible state
    }

    update() {
        if (this.isStunned > 0) {
            this.isStunned--;
            return;
        } // Stunned = skip update
        this.hitTimer++; // Incrémenter le timer de non-hit

        // Slow Mo Logic
        const mod = (window.game.activeModifier || window.game.conf.modifier);
        const timeScale = mod === 'slow_mo' ? 0.5 : 1.0;

        let speedMult = 1;
        if (this.activeEffects.speed > 0) {
            speedMult = 1.5;
            this.activeEffects.speed--;
        }
        if (mod === 'speed') speedMult *= 2;

        // Régénération HP après 5s sans dégâts (hitTimer > 300 frames)
        if (this.stats.passive === "Regen Rapide" && window.game.frame % 60 === 0 && this.hitTimer > 300 && mod !== 'oneshot') {
            this.hp = Math.min(this.maxHp, this.hp + 50);
        }

        let dx = 0,
            dy = 0;
        if (Input.jL.a) {
            dx = Input.jL.x;
            dy = Input.jL.y;
        } else {
            if (Input.k['KeyW']) dy = -1;
            if (Input.k['KeyS']) dy = 1;
            if (Input.k['KeyA']) dx = -1;
            if (Input.k['KeyD']) dx = 1;
        }
        const l = Math.hypot(dx, dy);
        // Vitesse de base ajustée (base 5.5, ici *1.1 pour un meilleur feeling global)
        const actualSpd = this.stats.spd * speedMult * 1.1 * timeScale;

        if (l > 0.1) {
            if (l > 1) {
                dx /= l;
                dy /= l;
            }
            this.move(dx * actualSpd, dy * actualSpd);
            // Footprints (Realism)
            if (window.game.frame % 15 === 0 && window.game.decals) {
                window.game.decals.push({
                    x: this.x,
                    y: this.y,
                    type: 'footprint',
                    angle: Math.atan2(dy, dx) + Math.PI / 2,
                    life: 600
                });
            }
            // Nouvelle fonctionnalité: Traînée de mouvement (Particules)
            if (window.game.frame % 2 === 0) {
                window.game.parts.push({
                    x: this.x,
                    y: this.y,
                    vx: -dx * 0.5,
                    vy: -dy * 0.5,
                    life: 10,
                    c: this.c,
                    r: 2
                });
            }
        }

        if (Input.jR.a) {
            this.angle = Math.atan2(Input.jR.y, Input.jR.x);
            if (Math.hypot(Input.jR.x, Input.jR.y) > 0.5) this.shoot();
        } else {
            const wx = Input.m.x + window.game.cam.x,
                wy = Input.m.y + window.game.cam.y;
            this.angle = Math.atan2(wy - this.y, wx - this.x);
            if (Input.m.d) this.shoot();
        }

        if (this.cd > 0) this.cd--;
        if (this.dashT > 0) this.dashT--;

        // PASSIVE DU SHAMAN : Poison Aura (Feature 2)
        if (this.stats.passive === "Poison Aura") {
            this.passiveTimer++;
            if (this.passiveTimer >= 30) { // Toutes les 0.5 secondes
                this.passiveTimer = 0;
                window.game.ents.forEach(e => {
                    if (!e.friend && Dist(this, e) < 150) {
                        e.hp -= 5;
                        e.hitTimer = 0;
                        e.flashColor = '#10b981';
                        e.flashTimer = 5;
                        window.game.parts.push({
                            x: e.x,
                            y: e.y,
                            vx: Rnd(-2, 2),
                            vy: Rnd(-2, 2),
                            life: 10,
                            c: '#10b981',
                            r: 2
                        });
                        if (e.hp <= 0 && !e.dead) window.game.kill(e);
                    }
                });
            }
        }

        if (this.ammo < this.ammoMax) {
            this.reloadT++;
            if (this.reloadT > this.stats.reload) {
                this.ammo++;
                this.reloadT = 0;
            }
        }
        // Régénération générale après 5s sans dégâts (Seulement si vivant)
        if (this.hp > 0 && window.game.frame % 60 === 0 && this.hp < this.maxHp && this.hitTimer > 300 && window.game.conf.modifier !== 'oneshot') this.hp += this.maxHp * 0.05;

        if (window.game.gasRadius && Dist(this, {
                x: window.game.world / 2,
                y: window.game.world / 2
            }) > window.game.gasRadius) {
            this.hp -= 10;
            this.hitTimer = 0;
            if(window.ui) window.ui.flash();
            if (this.hp < 1) {
                this.hp = 0;
                window.game.over("Tué par le Gaz");
            }
        }
        if (this.activeEffects.poison > 0) {
            this.hp -= 1;
            this.activeEffects.poison--;
            this.hitTimer = 0;
            if (this.hp < 1) {
                this.hp = 0;
                window.game.over("Empoisonné");
            }
        }

        // Recoil Decay
        if (this.recoilOffset > 0.1) this.recoilOffset *= 0.7;
        else this.recoilOffset = 0;

        // SECURITY CHECK: DEATH
        if (this.hp < 1 && window.game.state === 'PLAYING') {
            this.hp = 0;
            window.game.over("DÉFAITE");
        }

    }
    move(dx, dy) {
        const nx = this.x + dx,
            ny = this.y + dy;
        let cx = 0,
            cy = 0;
        for (let w of window.game.map) {
            if (w.type === 1) continue;
            if (w.collide({
                    x: nx,
                    y: this.y,
                    r: this.r
                })) cx = 1;
            if (w.collide({
                    x: this.x,
                    y: ny,
                    r: this.r
                })) cy = 1;
        }
        if (!cx) this.x = Math.max(this.r, Math.min(window.game.world - this.r, nx));
        if (!cy) this.y = Math.max(this.r, Math.min(window.game.world - this.r, ny));
    }
    shoot() {
        // FIX: Define timeScale from modifier (ReferenceError Fix)
        const mod = (window.game.activeModifier || window.game.conf.modifier);
        const timeScale = mod === 'slow_mo' ? 0.5 : 1.0;
        window.game.shake = 2;
        if (SoundManager) SoundManager.play('shoot');
        const selectedHero = STARTERS[USER.selected];
        if (selectedHero.name === 'Harpy' && this.cd > 0) {
            // Harpy a un CD très court (7), pas besoin de bloquer s'il est bas
        } else if (this.cd > 0 || (this.ammo < 1 && window.game.conf.modifier !== 'infinite')) {
            return;
        }

        const pStats = selectedHero.proj;

        // Les héros au corps-à-corps ont une gestion spéciale du CD et des munitions
        if (selectedHero.type === 'melee') {
            this.cd = this.stats.rate;
            // Le projectile corps-à-corps a une vie très courte (1 frame)
            window.game.projs.push({
                x: this.x + Math.cos(this.angle) * 25,
                y: this.y + Math.sin(this.angle) * 25,
                vx: 0,
                vy: 0,
                dmg: this.stats.dmg * (1 + this.cubes * 0.1),
                life: 3,
                r: pStats.r,
                c: pStats.color,
                friend: true,
                shape: pStats.shape,
                trailColor: pStats.trailColor,
                melee: true
            });
            return;
        }


        this.cd = this.stats.rate;
        this.recoilOffset = 8;
        if (window.game.conf.modifier !== 'infinite') this.ammo--;
        this.reloadT = -20;

        // Realism: Shooting Dust/Shockwave
        window.game.parts.push({
            x: this.x + Math.cos(this.angle) * 25,
            y: this.y + Math.sin(this.angle) * 25,
            vx: Math.cos(this.angle) * 2,
            vy: Math.sin(this.angle) * 2,
            life: 10,
            c: 'white',
            r: 10,
            shape: 'shockwave',
            decay: 1.2
        });


        const cnt = selectedHero.type === 'shotgun' ? 5 : 1;
        const spr = selectedHero.type === 'shotgun' ? 0.3 : 0.05; // Spread uniquement pour les shotguns

        let dmg = this.stats.dmg * (1 + this.cubes * 0.1);
        let isCrit = this.stats.passive === "Critique +10%" && Math.random() < 0.1;

        if (isCrit) {
            dmg *= 1.5; // Dégâts critiques +50%
        }

        if (window.game.conf.modifier === 'recoil') {
            this.move(Math.cos(this.angle + Math.PI) * 15, Math.sin(this.angle + Math.PI) * 15);
        }

        for (let i = 0; i < cnt; i++) {
            const a = this.angle + (Math.random() - 0.5) * spr + (i - (cnt - 1) / 2) * 0.1;

            window.game.projs.push({
                x: this.x + Math.cos(this.angle) * 25,
                y: this.y + Math.sin(this.angle) * 25,
                vx: Math.cos(a) * pStats.speed,
                vy: Math.sin(a) * pStats.speed,
                dmg: dmg,
                life: pStats.life,
                r: pStats.r,
                c: pStats.color,
                friend: true,
                isCrit: isCrit,
                shape: pStats.shape, // NOUVEAU
                trailColor: pStats.trailColor // NOUVEAU
            });
        }

        // Muzzle Flash & Shell Ejection
        const muzzleX = this.x + Math.cos(this.angle) * 25;
        const muzzleY = this.y + Math.sin(this.angle) * 25;

        // Shell Ejection (Realism)
        const shellAngle = this.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        window.game.parts.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(shellAngle) * (2 + Math.random() * 2),
            vy: Math.sin(shellAngle) * (2 + Math.random() * 2),
            life: 300,
            c: '#facc15',
            r: 2,
            shape: 'shell',
            angle: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5),
            gravity: false,
            friction: 0.95
        });

        for (let i = 0; i < 5; i++) {
            window.game.parts.push({
                x: muzzleX,
                y: muzzleY,
                vx: Math.cos(this.angle + Rnd(-0.5, 0.5)) * 3,
                vy: Math.sin(this.angle + Rnd(-0.5, 0.5)) * 3,
                life: 8,
                c: '#fff',
                r: Rnd(2, 5),
                decay: 0.5,
                shape: 'spark',
                angle: this.angle,
                vRot: 0
            });
        }
    }
    dash() {
        if (this.dashT > 0) return;
        this.dashT = 60;
        window.game.shake = 10;
        const stepSize = 20;
        const totalDist = 180;
        const steps = totalDist / stepSize;
        const dx = Math.cos(this.angle) * stepSize;
        const dy = Math.sin(this.angle) * stepSize;
        for (let i = 0; i < steps; i++) {
            this.move(dx, dy);
        }
        for (let i = 0; i < 8; i++) window.game.parts.push({
            x: this.x,
            y: this.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 20,
            c: '#fff',
            r: 4,
            gravity: false
        });
    }
    useGadget() {
        if (this.gadgetCharges <= 0) return;
        this.gadgetCharges--;
        if(window.ui) window.ui.notif("GADGET!", "#22c55e");
        const t = this.stats.gadget;

        if (t === "heal") {
            if (window.game.conf.modifier === 'oneshot') {
                if(window.ui) window.ui.notif("SOIN IMPOSSIBLE (ONE SHOT)", "#ef4444");
                this.gadgetCharges++;
                return;
            }
            this.hp = Math.min(this.maxHp, this.hp + 1000);
            for (let i = 0; i < 10; i++) window.game.parts.push({
                x: this.x,
                y: this.y,
                vx: Rnd(-2, 2),
                vy: Rnd(-2, 2),
                life: 30,
                c: '#22c55e',
                r: 3
            });
        }
        if (t === "shield") {
            if (window.game.conf.modifier === 'oneshot') {
                if(window.ui) window.ui.notif("BOUCLIER IMPOSSIBLE", "#ef4444");
                this.gadgetCharges++;
                return;
            }
            this.maxHp += 1000;
            this.hp += 1000;
        }
        if (t === "teleport") {
            let tx = this.x + Math.cos(this.angle) * 300,
                ty = this.y + Math.sin(this.angle) * 300;
            let cx = false;
            for (let w of window.game.map) {
                if (w.type !== 1 && w.collide({
                        x: tx,
                        y: ty,
                        r: this.r
                    })) cx = true;
            }
            if (!cx) {
                this.x = tx;
                this.y = ty;
            } else if(window.ui) window.ui.notif("BLOQUÉ !", "#ef4444");
        }
        if (t === "speed") {
            this.activeEffects.speed = 180;
        }
        if (t === "knockback") {
            for (let e of window.game.ents) {
                let d = Dist(this, e);
                if (d < 300) {
                    let a = Math.atan2(e.y - this.y, e.x - this.x);
                    e.x += Math.cos(a) * 200;
                    e.y += Math.sin(a) * 200;
                }
            }
        }
        // Feature 8: Nouveau Gadget 'stun'
        if (t === "stun") {
            for (let e of window.game.ents) {
                if (Dist(this, e) < 300) {
                    e.isStunned = 120;
                    e.flashColor = '#facc15';
                    e.flashTimer = 10;
                    window.game.parts.push({
                        x: e.x,
                        y: e.y,
                        vx: Rnd(-2, 2),
                        vy: Rnd(-2, 2),
                        life: 30,
                        c: '#facc15',
                        r: 5
                    });
                }
            }
        }
        if (t === "turret") {
            window.game.ents.push(new Turret(this.x, this.y, true));
            if(window.ui) window.ui.notif("TOURELLE DÉPLOYÉE", "#fbbf24");
        }
        if (t === "dash") {
            this.dashT = 0;
            this.dash();
        }
        if (t === "invis") {
            this.invisible = 180;
            if(window.ui) window.ui.notif("INVISIBLE !", "#94a3b8");
        }
    }
    draw(ctx) {
        ctx.save();
        ctx.shadowColor = this.c;
        ctx.shadowBlur = 20;

        // Si le joueur est stun, montrer un effet visuel
        if (this.isStunned > 0) {
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 30;
        }
        if (this.invisible > 0) ctx.globalAlpha = 0.4;
        else ctx.globalAlpha = 1;

        super.draw(ctx);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = (USER.equippedWeaponSkin === 'gold') ? '#eab308' : ((USER.equippedWeaponSkin === 'magma') ? '#ef4444' : '#1e293b');
        ctx.fillRect(10 - this.recoilOffset, -6, 28, 12);
        if (this.reloadT > 0 && window.game.conf.modifier !== 'infinite') {
            ctx.rotate(-this.angle);
            ctx.fillStyle = 'white';
            ctx.fillRect(-15, 30, 30 * (this.reloadT / this.stats.reload), 3);
        }
        ctx.restore();
    }
}
