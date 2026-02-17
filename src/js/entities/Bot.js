import { Player } from './Player.js';
import { USER } from '../core/State.js';
import { DIFFICULTY, SPEED_FACTOR, RATE_FACTOR, ENEMY_HP_BUFF } from '../data/constants.js';
import { Dist, ColRect, Rnd } from '../core/Utils.js';

export class Bot extends Player {
    constructor(isFriendly = false, heroType = null) {
        super(heroType || (USER.selected === 'soldier' ? 'tank' : 'soldier'));
        this.c = isFriendly ? '#3b82f6' : '#ef4444';
        this.isBot = true;
        this.friend = isFriendly;
        this.x = 100;
        this.y = 100;
        this.mode = 'CHASE';
        this.target = null;
        this.isStunned = 0;
        this.hitTimer = 300;
        this.hp += ENEMY_HP_BUFF;
        this.maxHp += ENEMY_HP_BUFF;

        const diffMult = DIFFICULTY[window.game.conf.difficulty].mult;
        this.hp *= diffMult;
        this.maxHp *= diffMult;
        this.stats.dmg *= diffMult;
        this.stats.spd *= (1 + (diffMult - 1) * 0.3);

        if (window.game.conf.modifier === 'oneshot') {
            this.hp = 1;
            this.maxHp = 1;
        }
    }
    update() {
        if (this.isStunned > 0) {
            this.isStunned--;
            return;
        }
        this.hitTimer++;

        // Bot Random Emote Logic
        if (Math.random() < 0.002) { // 0.2% chance per frame (approx once every 8-10 seconds)
            const happyEmotes = ['😀', '😎', '👍', '💪', '👑', '😂', '👻', '🤖'];
            const em = happyEmotes[Math.floor(Math.random() * happyEmotes.length)];
            this.triggerEmote(em);
        }

        if (this.cd > 0) this.cd--;

        // Logic Target Selection
        let target = null;
        if (!this.friend) {
            // Enemy Bot Target Selection (Player or Friendly Bots)
            let maxDist = 9999;
            // Check dist to player
            if (window.game.player && !window.game.player.dead) {
                const d = Dist(this, window.game.player);
                target = window.game.player;
                maxDist = d;
            }
            // Check dist to friendly bots
            window.game.ents.forEach(e => {
                if (e.friend && e !== window.game.player && !e.dead) {
                    const d = Dist(this, e);
                    if (d < maxDist) {
                        maxDist = d;
                        target = e;
                    }
                }
            });
        } else {
            let minD = 500;
            window.game.ents.forEach(e => {
                if ((!e.friend || (e.isBot && !e.friend) || (e.type && typeof e.type === 'string' && e.type.match(/basic|fast|tank|boss|mini_boss/))) && !e.dead && e !== this) {
                    // Friendly bot targeting enemy
                    if (this.friend && !e.friend) {
                        const d = Dist(this, e);
                        if (d < minD) {
                            minD = d;
                            target = e;
                        }
                    }
                    // Enemy bot targeting friendlies (Player or Friendly Bots)
                    else if (!this.friend && e.friend) {
                        const d = Dist(this, e);
                        if (d < minD) {
                            minD = d;
                            target = e;
                        }
                    }
                }
            });

            if (!target && this.friend) { // If friendly bot has no enemy target, chase player
                if (window.game.player && !window.game.player.dead) {
                    target = window.game.player;
                }
            }
        }

        // AI OBJECTIVE OVERRIDE
        if (window.game.conf.mode === 'ctf' && window.game.flags) {
            const myTeam = this.friend ? 'blue' : 'red';
            const enemyTeam = this.friend ? 'red' : 'blue';
            const myFlag = window.game.flags.find(f => f.team === myTeam);
            const enemyFlag = window.game.flags.find(f => f.team === enemyTeam);

            if (enemyFlag && enemyFlag.carrier === this) {
                // I have the flag! Return to base! Target is my flag base (implicit via start pos)
                // Blue Base ~ (100,100), Red Base ~ (World-100, World-100)
                target = {
                    x: (this.friend ? 200 : window.game.world - 200),
                    y: (this.friend ? 200 : window.game.world - 200),
                    r: 10
                };
            } else if (myFlag && myFlag.carrier) {
                // Enemy has my flag! Chase him! priority over other targets
                target = myFlag.carrier;
            } else if (enemyFlag && !enemyFlag.carrier) {
                // Enemy flag is available! Go get it!
                // Only switch if we don't have a critical target close by
                if (!target || Dist(this, target) > 300) target = enemyFlag;
            } else if (myFlag && !myFlag.isHome && !myFlag.carrier) {
                // My flag is dropped! Go return it!
                target = myFlag;
            }
        } else if (window.game.conf.mode === 'payload' && window.game.train) {
            // Stay near payload
            if (Dist(this, window.game.train) > 200) {
                target = window.game.train;
            }
        }

        if (!target) return; // No target, do nothing (or wander)

        const d = Dist(this, target);
        this.angle = Math.atan2(target.y - this.y, target.x - this.x);

        let targetHidden = false;

        const distV = Math.hypot(target.x - this.x, target.y - this.y);
        const stepsV = Math.min(10, Math.floor(distV / 50));
        for (let i = 1; i < stepsV; i++) {
            const cx = this.x + (target.x - this.x) * (i / stepsV);
            const cy = this.y + (target.y - this.y) * (i / stepsV);
            for (let w of window.game.map) {
                if (w.type !== 1 && ColRect({
                        x: cx,
                        y: cy,
                        r: 5
                    }, w)) {
                    targetHidden = true;
                    break;
                }
            }
            if (targetHidden) break;
        }

        if (target.invisible > 0) targetHidden = true;

        // Logique de tir
        if (d < 500 && !targetHidden && this.cd <= 0) {
            this.shoot();
        } else if (this.mode === 'CHASE' && Math.random() < 0.05 && d < 600) {
            this.shoot();
        }

        let tx, ty;
        if (this.mode === 'CHASE') {
            let strafe = Math.sin(window.game.frame * 0.08) * 150;
            tx = target.x + Math.cos(this.angle + Math.PI / 2) * strafe;
            ty = target.y + Math.sin(this.angle + Math.PI / 2) * strafe;
        } else if (this.mode === 'CHASE_TRAIN') {
            tx = this.target.x;
            ty = this.target.y; // Warning: this.target might be different logic in subclasses, keeping for safety
        } else {
            if (window.game.conf.mode === 'duel') {
                if (!this.target || Dist(this, this.target) < 50) this.target = {
                    x: window.game.world / 2 + Rnd(-300, 300),
                    y: window.game.world / 2 + Rnd(-300, 300)
                };
            } else {
                let item = window.game.items.find(i => Dist(this, i) < 300);
                if (item) {
                    this.target = item;
                } else if (!this.target || Dist(this, this.target) < 50 || Math.random() < 0.02) {
                    this.target = {
                        x: Rnd(100, window.game.world - 100),
                        y: Rnd(100, window.game.world - 100)
                    };
                }
            }
            tx = this.target?.x || this.x;
            ty = this.target?.y || this.y;
        }
        const a = Math.atan2(ty - this.y, tx - this.x);
        let speed = this.stats.spd * 0.96;
        const mod = (window.game.activeModifier || window.game.conf.modifier);
        if (mod === 'speed') speed *= 2;
        if (mod === 'slow_mo') speed *= 0.5;

        this.move(Math.cos(a) * speed, Math.sin(a) * speed);
        if (Math.random() < 0.01) this.dash();
        if (window.game.frame % 60 === 0 && this.hp < this.maxHp && this.hitTimer > 300 && window.game.conf.modifier !== 'oneshot') this.hp += Math.max(1, Math.floor(this.maxHp * 0.01));
        if (window.game.gasRadius && Dist(this, {
                x: window.game.world / 2,
                y: window.game.world / 2
            }) > window.game.gasRadius) this.hp -= 10;
        if (this.activeEffects.poison > 0) {
            this.hp -= 1;
            this.activeEffects.poison--;
        }
    }
    shoot() {
        if (this.cd > 0) return;
        this.cd = Math.ceil(20 * RATE_FACTOR);
        this.recoilOffset = 8;
        // Shell Ejection (Bot)
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
        window.game.projs.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(this.angle) * 15 * 1.08,
            vy: Math.sin(this.angle) * 15 * 1.08,
            dmg: 10,
            life: 60,
            r: 6,
            c: this.c,
            friend: this.friend,
            shape: 'circle',
            trailColor: this.c
        });
    }
}
