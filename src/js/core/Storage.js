import { USER, updateUser } from './State.js';
import { QuestSystem } from './QuestSystem.js';
import { CURRENT_VERSION_KEY, PREVIOUS_KEYS } from '../data/constants.js';

export function save() {
    localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(USER));
}

export function load() {
    // Check migration
    let d = localStorage.getItem(CURRENT_VERSION_KEY);
    let isMigration = false;

    if (!d) {
        // Try to find old data
        for (let key of PREVIOUS_KEYS) {
            const oldData = localStorage.getItem(key);
            if (oldData) {
                d = oldData;
                isMigration = true; // Found old data, so it's a migration
                break;
            }
        }
    }

    if (d) {
        try {
            const saved = JSON.parse(d);
            const mergedUser = { ...USER, ...saved,
                stats: { ...USER.stats, ...(saved.stats||{}), losses: saved.stats?.losses || 0, maxPassTier: saved.stats?.maxPassTier || 1 },
                pass: isMigration ? { tier: 1, xp: 0, claimed: [], claimedPro: [], claimedMax: [] } : { ...USER.pass, ...(saved.pass||{}) },
                shop: { ...USER.shop, ...(saved.shop||{}) },
                levels: { ...USER.levels, ...(saved.levels||{}) },
                emotes: saved.emotes || ['happy', 'angry', 'gg', 'rip'],
                equippedEmotes: saved.equippedEmotes || ['happy', 'angry', 'gg', 'rip'],
                mPassPro: saved.mPassPro || false, mPassMax: saved.mPassMax || false,
                skins: saved.skins || {},
                ownedSkins: saved.ownedSkins || [],
                quests: { daily: [], season: isMigration ? [] : (saved.quests?.season || []), club: [], lastGenerated: 0, lastClubGenerated: 0, ...(saved.quests || {}) },
                friends: saved.friends || [],
                claimedRanks: saved.claimedRanks || []
            };

            // Ensure new free hero is unlocked
            if(!mergedUser.unlocked.includes('drone')) mergedUser.unlocked.push('drone');

            updateUser(mergedUser);

            if (typeof window.game !== 'undefined') {
                if(!window.game.conf) window.game.conf = {};
                if(!saved.conf || !saved.conf.difficulty) window.game.conf.difficulty = 'normal';
                else window.game.conf.difficulty = saved.conf.difficulty;
                if(!saved.conf || !saved.conf.modifier) window.game.conf.modifier = 'normal';
                else window.game.conf.modifier = saved.conf.modifier;
                if(!saved.conf || typeof saved.conf.bots === 'undefined') window.game.conf.bots = 0;
                else window.game.conf.bots = saved.conf.bots;
            }

            save();

        } catch (e) {
             console.error("Erreur de chargement des données:", e);
        }
    } else {
        // Brand new user
        // Initialisation des nouvelles stats pour les nouveaux utilisateurs
        updateUser({
            ...USER,
            stats: { ...USER.stats, losses: 0, maxPassTier: 1 }
        });
    }
    QuestSystem.generateDaily();
    QuestSystem.generateSeason();
    QuestSystem.generateClub();
    if (window.ui && window.ui.refreshShop) {
        window.ui.refreshShop();
    }
}
