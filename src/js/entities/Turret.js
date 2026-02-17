import { Entity } from './Entity.js';
import { Dist } from '../core/Utils.js';

export class Turret extends Entity {
    constructor(x, y, isFriendly) {
        super(x, y, 15, isFriendly ? '#10b981' : '#ef4444');
        this.friend = isFriendly;
        this.type = 'turret';
        this.hp = 800;
        this.maxHp = 800;
        this.cd = 0;
        this.life = 900; // 15 seconds
        this.angle = 0;
    }

    update() {
        this.life--;
        if (this.life <= 0) {
            this.hp = 0;
            return;
        }
        if (this.cd > 0) this.cd--;

        let target = null;
        let minD = 400;
        if (window.game && window.game.ents) {
            for (let e of window.game.ents) {
                if (e !== this && !e.dead) {
                    const isEnemy = this.friend ? (!e.friend || (e.isBot && !e.friend) || (e.type && typeof e.type === 'string' && e.type.match(/basic|fast|tank|boss|mini_boss/))) : (e.friend);
                    if (isEnemy) {
                        const d = Dist(this, e);
                        if (d < minD) {
                            minD = d;
                            target = e;
                        }
                    }
                }
            }
        }

        if (target) {
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            if (this.cd <= 0) this.shoot();
        } else {
            this.angle += 0.05; // Scan
        }
    }

    shoot() {
        this.cd = 15;
        if (window.game) {
            window.game.projs.push({
                x: this.x + Math.cos(this.angle) * 20,
                y: this.y + Math.sin(this.angle) * 20,
                vx: Math.cos(this.angle) * 18,
                vy: Math.sin(this.angle) * 18,
                dmg: 12,
                life: 60,
                r: 5,
                c: this.friend ? '#34d399' : '#f87171',
                friend: this.friend,
                shape: 'circle',
                trailColor: this.friend ? '#10b981' : '#ef4444'
            });
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Tripod legs
        ctx.fillStyle = '#1e293b';
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate(i * (Math.PI * 2 / 3));
            ctx.fillRect(-2, 0, 4, 20);
            ctx.restore();
        }
        // Head
        ctx.rotate(this.angle);
        ctx.fillStyle = '#334155';
        ctx.fillRect(-10, -10, 20, 20); // Base
        ctx.fillStyle = this.c;
        ctx.fillRect(0, -6, 24, 12); // Barrel
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill(); // Top
        ctx.restore();

        // Life bar
        const lp = this.hp / this.maxHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 15, this.y - 25, 30, 4);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(this.x - 15, this.y - 25, 30 * lp, 4);
    }
}
