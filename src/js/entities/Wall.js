export class Wall {
    constructor(x, y, w, h, t) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = t;
    }

    draw(ctx, c) {
        // Ambiance ombre sous les murs
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(this.x, this.y + this.h, this.w, 20); // Ombre portée

        if (this.type === 1) { // BUISSONS
            ctx.fillStyle = 'rgba(22, 163, 74, 0.8)';
            ctx.fillRect(this.x, this.y, this.w, this.h);

            // Texture feuilles
            ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(this.x + Math.random() * this.w, this.y + Math.random() * this.h, 10 + Math.random() * 10, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            return;
        } else if (this.type === 3) { // INDESTRUCTIBLE (Hazard)
            ctx.fillStyle = '#c2410c'; // Dark Orange
            // Hazard stripes
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.clip();
            ctx.fillStyle = '#000';
            ctx.globalAlpha = 0.3;
            for (let i = -this.h; i < this.w; i += 20) {
                ctx.beginPath();
                ctx.moveTo(this.x + i, this.y);
                ctx.lineTo(this.x + i + 10, this.y);
                ctx.lineTo(this.x + i - this.h + 10, this.y + this.h);
                ctx.lineTo(this.x + i - this.h, this.y + this.h);
                ctx.fill();
            }
            ctx.restore();
            // Border
            ctx.strokeStyle = '#7c2d12';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        } else { // MUR STANDARD
            ctx.fillStyle = c;
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 10;
            ctx.fillRect(this.x, this.y, this.w, this.h);

            // Texture métallique / Rivets
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x + 5, this.y + 5, this.w - 10, this.h - 10); // Inner frame

            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath(); ctx.arc(this.x + 10, this.y + 10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(this.x + this.w - 10, this.y + 10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(this.x + 10, this.y + this.h - 10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(this.x + this.w - 10, this.y + this.h - 10, 3, 0, Math.PI * 2); ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(this.x, this.y, this.w, 4); // Top highlight
        ctx.restore();
    }

    collide(e) {
        return e.x + e.r > this.x && e.x - e.r < this.x + this.w && e.y + e.r > this.y && e.y - e.r < this.y + this.h;
    }
}
