import { Entity } from './Entity.js';
import { SPEED_FACTOR } from '../data/constants.js';

export class Train extends Entity {
    constructor() {
        super(100, window.game.world / 2, 30, '#3b82f6');
        this.hp = 20000;
        this.maxHp = 20000;
        this.type = 'train';
        this.angle = 0;
    }

    update() {
        // Move constantly to the right/across (vitesse du train réduite de 13%)
        const mod = (window.game.activeModifier || window.game.conf.modifier);
        const timeScale = mod === 'slow_mo' ? 0.5 : 1.0;
        this.x += 1 * SPEED_FACTOR * timeScale;
        if (this.x > window.game.world - 100) {
            this.x = 100; // Loop or just end? Let's loop for defense duration
        }
        // Visual smoke
        if (Math.random() < 0.3 && window.game) {
            window.game.parts.push({
                x: this.x - 30,
                y: this.y,
                vx: -2,
                vy: (Math.random() - 0.5),
                life: 40,
                c: '#555',
                r: 5
            });
        }
    }

    draw(ctx) {
        super.draw(ctx);
        // Health bar
        const pct = this.hp / this.maxHp;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - 30, this.y - this.r - 20, 60, 8);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(this.x - 29, this.y - this.r - 19, 58 * pct, 6);
        // Train body detail
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-20, -15, 40, 30);
        ctx.restore();
    }
}
