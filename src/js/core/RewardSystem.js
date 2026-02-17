import { USER } from './State.js';
import { save } from './Storage.js';
import { STARTERS } from '../data/heroes.js';
import { PASS_REWARDS, EMOTE_LIST } from '../data/constants.js';

export function openLootCrate() {
    let rewards = [];
    let totalValue = 0;
    const pulls = 7; // Feature 3: Mega caisse plus généreuse (7 pulls au lieu de 5)

    for (let i = 0; i < pulls; i++) {
        const r = Math.random();
        let type, value, color, icon;

        if (r < 0.5) { // 50% chance: Coins
            value = 150 + Math.floor(Math.random() * 250);
            USER.coins += value;
            type = 'Pièces'; icon = '🪙'; color = '#eab308';
            totalValue += value;
        } else if (r < 0.85) { // 35% chance: Gems
            value = 7 + Math.floor(Math.random() * 13);
            USER.gems += value;
            type = 'Gemmes'; icon = '💎'; color = '#a855f7';
            totalValue += value * 50; // Estimer la valeur
        } else { // 15% chance: XP Boost
            value = 150;
            USER.pass.xp += value;
            type = 'XP Pass'; icon = '🎫'; color = '#22d3ee';
            totalValue += value * 2;
        }
        rewards.push({ icon, value, type });
    }

    // Traitement de l'XP
    while(USER.pass.xp >= 100) {
        if(USER.pass.tier < 50) {
            USER.pass.tier++;
            USER.pass.xp -= 100;
            if(window.ui) window.ui.notif("PASS LEVEL UP!", "#facc15");
        } else {
            USER.pass.xp = 100;
            break;
        }
    }

    // Affichage des récompenses
    let message = rewards.map(r => `${r.icon} +${r.value} ${r.type}`).join(', ');
    if(window.ui) window.ui.notif(`BUTIN DE LA CAISSE : ${message}`, '#facc15');
    save();
    if(window.ui) {
        window.ui.updateMenu();
        window.ui.renderPass();
    }
}

export function processPassReward(rewardString) {
    const [type, value] = rewardString.split(':');
    const val = parseInt(value) || 1;
    let success = false;

    // SECURITY CHECK
    console.log(`[SECURE] Processing Reward: ${type} x${val}`);

    if (type === 'coins') {
        USER.coins += val;
        save();
        if(window.ui) {
            window.ui.updateMenu();
            window.ui.notif(`+${val} 🪙`, "#eab308", "reward");
            try {
                const el = document.getElementById('top-coins');
                if(el) {
                    el.closest('.currency-badge').classList.add('flash-coins');
                    setTimeout(() => el.closest('.currency-badge').classList.remove('flash-coins'), 300);
                }
            } catch(e){}
        }
        success = true;
    } else if (type === 'gems') {
        USER.gems += val;
        save();
        if(window.ui) {
            window.ui.updateMenu();
            window.ui.notif(`+${val} 💎`, "#a855f7", "reward");
            try {
                const el = document.getElementById('top-gems');
                if(el) {
                    el.closest('.currency-badge').classList.add('flash-gems');
                    setTimeout(() => el.closest('.currency-badge').classList.remove('flash-gems'), 300);
                }
            } catch(e){}
        }
        success = true;
    } else if (type === 'box') {
        // window.ui.buy might need refactoring or we import UI?
        // For now, assume window.ui exists
        if(window.ui && window.ui.buy) {
            for(let i=0; i<val; i++) window.ui.buy('box', 0, 'free');
        }
        success = true;
    } else if (type === 'mega_caisse_loot') { // NOUVEAU TYPE DE BUTIN
        for(let i=0; i<val; i++) openLootCrate();
        success = true;
    } else if (type.startsWith('emote')) {
        const emoteId = type.split(':')[1];
        if (!USER.emotes.includes(emoteId)) {
            USER.emotes.push(emoteId);
            if(window.ui) {
                window.ui.notif(`EMOTE DÉBLOQUÉE: ${EMOTE_LIST.find(e => e.id === emoteId)?.i}`, "#22d3ee");
                window.ui.renderEmotes();
            }
        }
        success = true;
    } else if (type.startsWith('skin')) {
        const [heroId, skinId] = type.split(':')[1].split('_');
        const fullSkinId = `${heroId}_${skinId}`;
        if (!USER.ownedSkins.includes(fullSkinId)) {
            USER.ownedSkins.push(fullSkinId);
            const skinName = STARTERS[heroId]?.skins.find(s => s.id === skinId)?.name || 'Skin';
            if(window.ui) {
                window.ui.notif(`SKIN DÉBLOQUÉ: ${skinName}!`, "#facc15");
                window.ui.renderLists(); // Pour mettre à jour la sélection de skin
            }
        }
        success = true;
    }
    return success;
}

export function getPassReward(tier, type) {
    const r = PASS_REWARDS[tier];
    if (r && r[type]) return r[type];
    if (type === 'max') return (tier % 5 === 0) ? 'gems:30' : 'coins:200';
    if (type === 'pro') return (tier % 5 === 0) ? 'mega_caisse_loot:1' : 'gems:15';
    return (tier % 3 === 0) ? 'gems:5' : 'coins:50';
}
