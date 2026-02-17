import { Entity } from './Entity.js';
import { Dist } from '../core/Utils.js';
import { SPEED_FACTOR } from '../data/constants.js';

export class Payload extends Entity {
    constructor() {
        super(150, window.game.world / 2, 40, '#f97316');
        this.hp = 10000;
        this.maxHp = 10000;
        this.type = 'payload';
        this.angle = 0;
    }

    update() {
        // Move if player or friendly bot is near
        let pushing = false;
        if (Dist(this, window.game.player) < 250) pushing = true;
        else {
            if (window.game && window.game.ents) {
                for (let e of window.game.ents) {
                    if (e.friend && e.isBot && Dist(this, e) < 250) {
                        pushing = true;
                        break;
                    }
                }
            }
        }

        if (pushing) {
            const mod = (window.game.activeModifier || window.game.conf.modifier);
            const timeScale = mod === 'slow_mo' ? 0.5 : 1.0;
            this.x += 1.5 * SPEED_FACTOR * timeScale;
            if (window.game.frame % 20 === 0) window.game.parts.push({
                x: this.x - 30,
                y: this.y + 20,
                vx: -2,
                vy: 0,
                life: 20,
                c: '#555',
                r: 4
            });
        }

        if (this.x > window.game.world - 150) {
            window.game.over("VICTOIRE");
        }
    }

    draw(ctx) {
        super.draw(ctx);
        // Health bar
        const pct = this.hp / this.maxHp;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - 30, this.y - this.r - 25, 60, 8);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(this.x - 29, this.y - this.r - 24, 58 * pct, 6);

        // Draw Wagon
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(-25, -20, 50, 40);
        ctx.fillStyle = '#fdba74'; // Gold/Cargo
        ctx.fillRect(-20, -15, 40, 30);
        // Wheels
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-20, 20, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(20, 20, 10, 0, Math.PI * 2);
        ctx.fill();

        // Radius circle
        let inRange = Dist(this, window.game.player) < 250;
        if (!inRange) {
            if (window.game && window.game.ents) {
                for (let e of window.game.ents) {
                    if (e.friend && e.isBot && Dist(this, e) < 250) {
                        inRange = true;
                        break;
                    }
                }
            }
        }

        if (!inRange) {
            ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.arc(0, 0, 250, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)'; // Green when pushing
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 250, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}
