export const Rnd = (min,max) => Math.random()*(max-min)+min;
export const Dist = (e1,e2) => Math.hypot(e1.x-e2.x, e1.y-e2.y);
export const ColRect = (c, r) => c.x+c.r > r.x && c.x-c.r < r.x+r.w && c.y+c.r > r.y && c.y-c.r < r.y+r.h;

export function resolveCollision(e1, e2) {
    let dx=e1.x-e2.x, dy=e1.y-e2.y; let dist=Math.hypot(dx,dy); const minDist=e1.r+e2.r;
    if(dist < minDist) {
        if(dist <= 0.01) { dx=1; dy=0; dist=1; }
        const overlap=minDist-dist, nx=dx/dist, ny=dy/dist;

        // Masse inversée: entités statiques (chest/core/train/terminal) ont masse infinie (1 / Infinity = 0)
        const isStatic1 = (e1.type==='chest' || e1.type==='core' || e1.type==='train' || e1.type==='terminal');
        const isStatic2 = (e2.type==='chest' || e2.type==='core' || e2.type==='train' || e2.type==='terminal');

        let m1 = isStatic1 ? 0 : (e1 === window.game.player ? 1 : 0.5); // Player mass 1, Bot mass 0.5
        let m2 = isStatic2 ? 0 : (e2 === window.game.player ? 1 : 0.5);

        const totalMass = m1 + m2;

        let ratio1 = totalMass ? m2 / totalMass : 0;
        let ratio2 = totalMass ? m1 / totalMass : 0;

        if (isStatic1 && !isStatic2) { ratio1 = 0; ratio2 = 1; }
        else if (!isStatic1 && isStatic2) { ratio1 = 1; ratio2 = 0; }
        else if (isStatic1 && isStatic2) { return; }

        // FIX ANTI-PUSH REWORK: Player Heavy, Bots Light
        const isPlayer1 = e1 === window.game.player;
        const isPlayer2 = e2 === window.game.player;

        if (isPlayer1 && !isStatic2 && (e2.isBot || (!e2.isBoss && e2.type !== 'train'))) {
            ratio1 = 0.1; ratio2 = 0.9; // Player pushes bot/enemy
        } else if (isPlayer2 && !isStatic1 && (e1.isBot || (!e1.isBoss && e1.type !== 'train'))) {
            ratio1 = 0.9; ratio2 = 0.1; // Bot/enemy bounces off player
        } else if (e1 === window.game.player && isStatic2) { ratio1 = 1; ratio2 = 0; }
        else if (e2 === window.game.player && isStatic1) { ratio1 = 0; ratio2 = 1; }


        e1.x += nx * overlap * ratio1;
        e1.y += ny * overlap * ratio1;
        e2.x -= nx * overlap * ratio2;
        e2.y -= ny * overlap * ratio2;
    }
}
