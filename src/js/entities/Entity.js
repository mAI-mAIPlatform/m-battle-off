import { ColRect } from '../core/Utils.js';

export class Entity {
    constructor(x, y, r, c) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
        this.dead = false;
        this.hitTimer = 300;
        this.emote = '';
        this.emoteTimer = 0;
    }

    triggerEmote(emoji) {
        this.emote = emoji;
        this.emoteTimer = 120;
    }

    update() {
        // Base update, to be overridden
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        let isHidden = false;
        if (window.game && window.game.map) {
            for (let w of window.game.map) {
                if (w.type === 1 && ColRect(this, w)) {
                    isHidden = true;
                    break;
                }
            }
        }

        if (isHidden && this === window.game.player) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("👁️", 0, -this.r - 10);
            ctx.beginPath();
            ctx.moveTo(0, -this.r - 5);
            ctx.lineTo(0, -this.r - 25); // Simple line up
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (isHidden) ctx.globalAlpha = 0.5;

        // Realism: Elliptical Ground Shadow (Dynamic)
        ctx.save();
        ctx.translate(0, this.r * 0.8);
        ctx.scale(1, 0.3);
        const shadowSize = this.r * (1.2 + Math.sin(window.game.frame * 0.1) * 0.05); // Subtle breathing shadow
        ctx.beginPath();
        ctx.arc(0, 0, shadowSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();
        ctx.restore();

        // Object Body
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.c;
        ctx.fill();

        // Inner lighting/highlight for 3D feel
        ctx.save();
        ctx.clip();
        ctx.beginPath();
        ctx.arc(-this.r * 0.3, -this.r * 0.3, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fill();
        ctx.restore();

        // Specular highlight
        ctx.beginPath();
        ctx.arc(-5, -5, this.r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();

        ctx.globalAlpha = 1;

        // Draw Emote
        if (this.emoteTimer > 0) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(0, -this.r - 30, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = "24px Arial";
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(this.emote, 0, -this.r - 22);
            this.emoteTimer--;
        }

        ctx.restore();
    }
}
