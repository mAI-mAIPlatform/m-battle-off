import { USER } from './State.js';
import { save } from './Storage.js';
import { MODES, ARENAS } from '../data/gameData.js';
import { STARTERS } from '../data/heroes.js';
import { openLootCrate } from './RewardSystem.js';

export const QuestSystem = {
    generateDaily() {
        const now = Date.now();
        if (now - USER.quests.lastGenerated > 86400000) { // 24h
            USER.quests.daily = [];
            USER.quests.lastGenerated = now;
            // Generate 5 to 7 random quests
            const count = 5 + Math.floor(Math.random() * 3);
            const modeKeys = Object.keys(MODES).filter(k => !MODES[k].boss && !MODES[k].special);
            const heroKeys = Object.keys(STARTERS);

            for(let i=0; i<count; i++) {
                const type = Math.random();
                let q = { id: Math.random().toString(36).substr(2, 9), progress: 0, completed: false, claimed: false };

                if (type < 0.15) {
                    const m = modeKeys[Math.floor(Math.random() * modeKeys.length)];
                    q.type = 'play'; q.mode = m; q.target = 3; q.desc = `Jouer 3 parties en ${MODES[m].name}`; q.reward = { type: 'xp', val: 150 };
                } else if (type < 0.30) {
                    const arenaKeys = Object.keys(ARENAS);
                    const a = arenaKeys[Math.floor(Math.random() * arenaKeys.length)];
                    q.type = 'play'; q.arena = a; q.target = 3; q.desc = `Jouer 3 parties sur ${ARENAS[a].name}`; q.reward = { type: 'xp', val: 150 };
                } else if (type < 0.45) {
                    q.type = 'kill'; q.target = 50 + Math.floor(Math.random()*50); q.desc = `Éliminer ${q.target} ennemis`; q.reward = { type: 'coins', val: 200 };
                } else if (type < 0.55) {
                    q.type = 'xp'; q.target = 500 + Math.floor(Math.random()*500); q.desc = `Gagner ${q.target} XP`; q.reward = { type: 'xp', val: 150 };
                } else if (type < 0.70) {
                    const h = heroKeys[Math.floor(Math.random() * heroKeys.length)];
                    q.type = 'play'; q.hero = h; q.target = 2; q.desc = `Jouer 2 parties avec ${STARTERS[h].name}`; q.reward = { type: 'gems', val: 5 };
                } else if (type < 0.85) {
                    const amount = 5000 + Math.floor(Math.random() * 10000);
                    q.type = 'dmg'; q.target = amount; q.desc = `Infliger ${amount} dégâts`; q.reward = { type: 'coins', val: 250 };
                } else if (type < 0.93) {
                    q.type = 'collect'; q.target = 10; q.itemType = 'coins'; q.desc = "Ramasser 10 tas de pièces"; q.reward = { type: 'coins', val: 300 };
                } else {
                    q.type = 'win'; q.target = 1; q.desc = "Gagner 1 partie"; q.reward = { type: 'box', val: 1 };
                }
                USER.quests.daily.push(q);
            }
            save();
        }
    },
    generateClub() {
        const now = Date.now();
        if (!USER.club) return;

        // Initialize club quests if missing
        if (!USER.quests.club) USER.quests.club = [];

        if (USER.club && (USER.quests.club.length === 0 || now - (USER.quests.lastClubGenerated || 0) > 86400000)) {
            USER.quests.club = [];
            USER.quests.lastClubGenerated = now;
            // Generate 3 random club quests
            for(let i=0; i<3; i++) {
                const type = Math.random();
                let q = { id: 'c'+Math.random().toString(36).substr(2, 9), progress: 0, completed: false, claimed: false };

                // Club Quests are harder but give more
                if (type < 0.3) {
                    q.type = 'play'; q.mode = 'team_battle'; q.target = 5; q.desc = `Jouer 5 Team Battle avec le Club`; q.reward = { type: 'xp', val: 300 };
                } else if (type < 0.6) {
                    q.type = 'win'; q.target = 3; q.desc = "Gagner 3 parties pour le Club"; q.reward = { type: 'coins', val: 500 };
                } else {
                    const amount = 20000;
                    q.type = 'dmg'; q.target = amount; q.desc = `Infliger ${amount} dégâts (Club)`; q.reward = { type: 'gems', val: 10 };
                }
                USER.quests.club.push(q);
            }
            save();
        }
    },
    generateSeason() {
        if (!USER.quests.season || USER.quests.season.length < 10) { // Force update if not enough quests
           // Existing quests preservation could be done here, but simpler to reset/init for this "Saison 3" update
           USER.quests.season = [
               { id: 's3_q1', type: 'play', mode: 'thunder_capture', target: 5, progress: 0, completed: false, claimed: false, desc: "Jouer 5 parties Capture Foudre", reward: { type: 'xp', val: 500 } },
               { id: 's3_q2', type: 'play', arena: 'thunder_arena', target: 5, progress: 0, completed: false, claimed: false, desc: "Jouer 5 parties Temple Foudre", reward: { type: 'xp', val: 500 } },
               { id: 's3_q3', type: 'play', hero: 'zeus', target: 3, progress: 0, completed: false, claimed: false, desc: "Jouer 3 fois avec Zeus", reward: { type: 'gems', val: 50 } },
               { id: 's3_q4', type: 'dmg', target: 100000, progress: 0, completed: false, claimed: false, desc: "Infliger 100k Dégâts (Total)", reward: { type: 'mega_caisse_loot', val: 1 } },
               { id: 's3_q5', type: 'win', target: 10, progress: 0, completed: false, claimed: false, desc: "Gagner 10 parties", reward: { type: 'gems', val: 50 } },
               { id: 's3_q6', type: 'play', hero: 'drone', target: 3, progress: 0, completed: false, claimed: false, desc: "Jouer 3 fois avec Drone", reward: { type: 'xp', val: 300 } },
               { id: 's3_q7', type: 'kill', target: 500, progress: 0, completed: false, claimed: false, desc: "Éliminer 500 ennemis", reward: { type: 'coins', val: 2000 } },
               { id: 's3_q8', type: 'collect', itemType: 'gems', target: 50, progress: 0, completed: false, claimed: false, desc: "Récupérer 50 Gemmes au sol", reward: { type: 'skin', val: 1, name: 'Skin Aléatoire' } },
               { id: 's3_q9', type: 'survive', target: 15, progress: 0, completed: false, claimed: false, desc: "Survivre Vague 15 (Survie)", reward: { type: 'box', val: 3 } },
               { id: 's3_q10', type: 'play', mode: 'heist', target: 5, progress: 0, completed: false, claimed: false, desc: "Jouer 5 parties Braquage", reward: { type: 'xp', val: 400 } },
               { id: 's3_q11', type: 'kill', target: 1000, progress: 0, completed: false, claimed: false, desc: "Tueur en série (1000 Kills)", reward: { type: 'gems', val: 100 } },
               { id: 's3_q12', type: 'xp', target: 5000, progress: 0, completed: false, claimed: false, desc: "Gagner 5000 XP", reward: { type: 'coins', val: 5000 } },
               { id: 's3_q13', type: 'play', mode: 'ranked', target: 10, progress: 0, completed: false, claimed: false, desc: "Jouer 10 parties Classées", reward: { type: 'mega_caisse_loot', val: 2 } },
               { id: 's3_q14', type: 'play', mode: 'cyber_hack', target: 3, progress: 0, completed: false, claimed: false, desc: "Pirater 3 Terminaux (Cyber Hack)", reward: { type: 'gems', val: 30 } },
               { id: 's3_q15', type: 'play', hero: 'tank', target: 5, progress: 0, completed: false, claimed: false, desc: "Jouer 5 fois avec Heavy", reward: { type: 'xp', val: 500 } },
               { id: 's3_q16', type: 'dmg', target: 500000, progress: 0, completed: false, claimed: false, desc: "Dégâts Massifs (500k)", reward: { type: 'gems', val: 150 } },
               { id: 's3_q17', type: 'collect', itemType: 'coins', target: 200, progress: 0, completed: false, claimed: false, desc: "Riche: 200 tas de pièces", reward: { type: 'xp', val: 1000 } },
               { id: 's3_q18', type: 'play', arena: 'moon', target: 5, progress: 0, completed: false, claimed: false, desc: "Mission Lunaire (5 parties)", reward: { type: 'box', val: 3 } },
               { id: 's3_q19', type: 'play', mode: 'infection', target: 5, progress: 0, completed: false, claimed: false, desc: "Survivre à l'infection (5 fois)", reward: { type: 'coin', val: 1000 } },
               { id: 's3_q20', type: 'win', target: 50, progress: 0, completed: false, claimed: false, desc: "Gagner 50 parties", reward: { type: 'skin', val: 1, name: 'Skin Épique' } },
               { id: 's3_q21', type: 'kill', target: 100, progress: 0, completed: false, claimed: false, desc: "Chasseur : 100 Kills", reward: { type: 'xp', val: 200 } },
               { id: 's3_q22', type: 'play', mode: 'rampage', target: 3, progress: 0, completed: false, claimed: false, desc: "Faire 3 Carnages", reward: { type: 'coins', val: 500 } },
               { id: 's3_q23', type: 'play', mode: 'thunder_capture', target: 10, progress: 0, completed: false, claimed: false, desc: "Maître de la Foudre (10 parties)", reward: { type: 'gems', val: 50 } },
           ];
           save();
        }
    },
    check(type, data) {
        let changed = false;
        const checkList = (list) => {
            list.forEach(q => {
                if (q.completed) return;
                let match = false;
                if (q.type === type) {
                    if (q.type === 'play') {
                        if (q.mode && q.mode !== data.mode) return;
                        if (q.arena && q.arena !== data.arena) return;
                        if (q.hero && q.hero !== data.hero) return;
                        match = true;
                    } else if (q.type === 'kill') {
                        match = true;
                    } else if (q.type === 'xp') {
                        match = true;
                    } else if (q.type === 'dmg') {
                        match = true;
                    } else if (q.type === 'collect') {
                        if (q.itemType && q.itemType !== data.itemType) return;
                        match = true;
                    } else if (q.type === 'win') {
                        if (q.mode && q.mode !== data.mode) return;
                        if (q.arena && q.arena !== data.arena) return;
                        match = true;
                    } else if (q.type === 'survive') {
                        if (data.wave >= q.target) { q.progress = q.target; match = true; } // Direct completion for survive wave X
                    }
                }
                if (match) {
                    if (type === 'xp' || type === 'dmg' || type === 'collect') q.progress += data.amount || 1;
                    else if(type !== 'survive') q.progress++;

                    if (q.progress >= q.target) { q.progress = q.target; q.completed = true; if(window.ui) window.ui.notif("QUÊTE TERMINÉE !", "#22c55e", "quest"); }
                    changed = true;
                }
            });
        };
        if (USER.quests) {
            checkList(USER.quests.daily);
            checkList(USER.quests.season);
            if(USER.quests.club) checkList(USER.quests.club);
        }
        if (changed) save();
    },
    claim(listType, id) {
        const list = USER.quests[listType];
        const q = list.find(x => x.id === id);
        if (q && q.completed && !q.claimed) {
            q.claimed = true;
            if (q.reward.type === 'xp') {
                USER.pass.xp += q.reward.val; if(window.ui) window.ui.notif(`+${q.reward.val} XP`, "#22c55e");
                while(USER.pass.xp >= 100) { if(USER.pass.tier < 50) { USER.pass.tier++; USER.pass.xp -= 100; if(window.ui) window.ui.notif("PASS LEVEL UP!", "#facc15"); } else { USER.pass.xp = 100; break; } }
            } else if (q.reward.type === 'coins') { USER.coins += q.reward.val; if(window.ui) window.ui.notif(`+${q.reward.val} 🪙`, "#eab308"); }
            else if (q.reward.type === 'gems') { USER.gems += q.reward.val; if(window.ui) window.ui.notif(`+${q.reward.val} 💎`, "#a855f7"); }
            else if (q.reward.type === 'box') { if(window.ui) window.ui.buy('box', 0, 'free'); }
            else if (q.reward.type === 'mega_caisse_loot') { openLootCrate(); }
            else if (q.reward.type === 'skin') {
                // Récompense Skin Aléatoire
                const keys = Object.keys(STARTERS);
                const candidates = [];
                keys.forEach(k => {
                    if(STARTERS[k].skins) STARTERS[k].skins.forEach(s => {
                        if(!USER.ownedSkins.includes(`${k}_${s.id}`)) candidates.push({h: k, s: s});
                    });
                });

                if(candidates.length > 0) {
                    const win = candidates[Math.floor(Math.random() * candidates.length)];
                    USER.ownedSkins.push(`${win.h}_${win.s.id}`);
                    if(window.ui) window.ui.notif(`SKIN DÉBLOQUÉ: ${win.s.name} (${STARTERS[win.h].name})`, "#facc15");
                } else {
                    USER.gems += 50; if(window.ui) window.ui.notif("TOUS SKINS POSSÉDÉS -> +50 💎", "#a855f7");
                }
            }
            save();
            if(window.ui) {
                window.ui.renderProfile();
                window.ui.updateMenu();
            }
        }
    },
    refreshDaily() {
        if (USER.gems >= 10) {
            console.log("[SECURE] Daily Quests Refresh (-10 gems)");
            USER.gems -= 10;
            USER.quests.lastGenerated = 0; // Force regen
            this.generateDaily();
            save();
            if(window.ui) {
                window.ui.renderProfile();
                window.ui.updateMenu();
                window.ui.notif("-10 💎 QUÊTES ACTUALISÉES", "#a855f7");
            }
        } else {
            if(window.ui) window.ui.notif("PAS ASSEZ DE GEMMES (10 💎)", "#ef4444");
        }
    },
    hasQuest(type, filter) {
        if(!USER.quests) return false;
        const all = [...USER.quests.daily, ...USER.quests.season];
        return all.some(q => {
           if(q.completed || q.claimed) return false;
           if(q.type !== type) return false;
           if(filter) {
               for(let k in filter) {
                   if(q[k] !== filter[k]) return false;
               }
           }
           return true;
        });
    }
};
