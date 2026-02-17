import { Entity } from './Entity.js';
import { Dist } from '../core/Utils.js';

export class Flag extends Entity {
    constructor(team, x, y) {
        super(x, y, 15, team === 'blue' ? '#3b82f6' : '#ef4444');
        this.team = team;
        this.baseX = x;
        this.baseY = y;
        this.carrier = null;
        this.isHome = true;
        this.returnTimer = 0;
    }

    update() {
        if (this.carrier) {
            if (this.carrier.dead) {
                this.drop();
            } else {
                this.x = this.carrier.x;
                this.y = this.carrier.y - 20;
                this.isHome = false;
            }
        } else {
            if (!this.isHome) {
                this.returnTimer--;
                if (this.returnTimer <= 0) this.returnToBase();
            }
            if (window.game) {
                let inRange = [window.game.player, ...window.game.ents].filter(e => !e.dead && Dist(this, e) < this.r + e.r && !(e instanceof Flag));
                for (let e of inRange) {
                    let isFriend = (e.friend && this.team === 'blue') || (!e.friend && this.team === 'red');
                    if (!isFriend) {
                        this.pickUp(e);
                        break;
                    } else {
                        if (!this.isHome) {
                            this.returnToBase();
                            break;
                        } else if (window.game.flags) {
                            let other = window.game.flags.find(f => f.team !== this.team);
                            if (other && other.carrier === e) {
                                if (this.team === 'blue') {
                                    window.game.teamScore++;
                                    if(window.ui) window.ui.notif("POINT BLEU !", "#3b82f6");
                                } else {
                                    window.game.enemyScore++;
                                    if(window.ui) window.ui.notif("POINT ROUGE !", "#ef4444");
                                }
                                other.returnToBase();
                                if (window.game.teamScore >= 3) window.game.over("VICTOIRE");
                                if (window.game.enemyScore >= 3) window.game.over("DÉFAITE");
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    drop() {
        this.carrier = null;
        this.returnTimer = 600;
        if(window.ui) window.ui.notif(`DRAPEAU ${this.team === 'blue' ? 'BLEU' : 'ROUGE'} TOMBÉ !`, this.c);
    }

    pickUp(e) {
        if (this.carrier) return;
        this.carrier = e;
        this.isHome = false;
        if(window.ui) window.ui.notif(`DRAPEAU LEVÉ !`, this.c);
    }

    returnToBase() {
        this.x = this.baseX;
        this.y = this.baseY;
        this.carrier = null;
        this.isHome = true;
        if(window.ui) window.ui.notif(`DRAPEAU ${this.team === 'blue' ? 'BLEU' : 'ROUGE'} RETOURNÉ !`, this.c);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = 'white';
        ctx.fillRect(-2, -30, 4, 30);
        ctx.fillStyle = this.c;
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(20, -20);
        ctx.lineTo(0, -10);
        ctx.fill();
        if (this.isHome) {
            ctx.strokeStyle = this.c;
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}
