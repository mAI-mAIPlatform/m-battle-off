export let USER = {
    name: "Joueur", avatar: "👤", tag: "#" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    coins: 500, gems: 10, trophies: 0, unlocked: ['soldier', 'drone'], levels: { soldier: 1, drone: 1 }, selected: 'soldier',
    stats: { kills: 0, maxWave: 0, games: 0, wins: 0, dmg: 0, losses: 0, maxPassTier: 1 },
    lastDaily: 0,
    pass: { tier: 1, xp: 0, claimed: [], claimedPro: [] },
    shop: { lastRefresh: 0, items: [] },
    emotes: ['happy', 'angry', 'gg', 'rip'], equippedEmotes: ['happy', 'angry', 'gg', 'rip'],
    mPassPro: false,
    skins: {},
    ownedSkins: [],
    quests: { daily: [], season: [], club: [], lastGenerated: 0, lastClubGenerated: 0 },
    // V1.4.0 Features
    friends: [], // [{ name, avatar, status }]
    bio: "Aucune bio définie...", email: "", phone: "", dob: "", theme: "blue",
    claimedRanks: [],
    club: null, // { name: "Alpha", role: "Member", messages: [] }
    mastery: {}, // { soldier: { xp: 0, lvl: 1 } }
    adventures: {}, // { soldier: 1 } (Chapter unlocked)
    maps: [], // Custom maps { name: "My Map", data: ... }
    weaponSkins: {}, // { soldier: 'gold_gun' }
    settings: { sound: true, music: true }
};

export function updateUser(newUser) {
    // Helper to update USER reference content without breaking imports
    Object.assign(USER, newUser);
}
