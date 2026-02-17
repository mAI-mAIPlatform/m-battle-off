export const MODES = {
    survival: { name: "Survie", icon: "🧟", desc: "Vagues infinies.", ranked: false },
    ranked: { name: "Classé", icon: "🏆", desc: "Compétition.", ranked: true },
    duel: { name: "1v1 Duel", icon: "⚔️", desc: "Duel Bot IA.", ranked: false, boss: true },
    heist: { name: "Braquage", icon: "💎", desc: "Détruis le coffre!", ranked: false, boss: true },
    boss_rush: { name: "Boss Rush", icon: "👹", desc: "Combat de Boss.", ranked: false, boss: true },
    defense: { name: "Défense", icon: "🛡️", desc: "Protège le cristal.", ranked: false, boss: true },
    infection: { name: "Infection", icon: "☣️", desc: "Survivre à la horde.", ranked: false },
    train_defense: { name: "Train Express", icon: "🚂", desc: "Protège le train !", ranked: false },
    thief: { name: "Voleur", icon: "💰", desc: "Vole 10 sacs !", ranked: false },
    cyber_hack: { name: "Cyber Hack", icon: "💻", desc: "Pirate les zones !", ranked: false, special: false },
    thunder_capture: { name: "Capture Foudre", icon: "⚡", desc: "Capture la zone mouvante !", ranked: false, special: true },
    gungame: { name: "Jeu d'Armes", icon: "🔫", desc: "Change d'arme à chaque kill !", ranked: false, special: false },
    escape: { name: "Cyber Escape", icon: "🛸", desc: "Rejoins l'extraction !", ranked: false, special: false },
    rampage: { name: "Carnage", icon: "😡", desc: "Tuer 50 ennemis !", ranked: false, special: false },
    zone_control: { name: "Zone", icon: "⭕", desc: "Contrôle la zone !", ranked: false, special: false },
    treasure: { name: "Chasse", icon: "👑", desc: "Trouve les trésors !", ranked: false, special: false },
    sniper_duel: { name: "Duel Sniper", icon: "🔭", desc: "Tir de précision.", ranked: false },
    giant_hunt: { name: "Chasse Géant", icon: "👹", desc: "Abattez le colosse.", ranked: false },
    golden_chase: { name: "Ruée vers l'Or", icon: "💰", desc: "Collecte max !", ranked: false },
    infection_hard: { name: "Infection +", icon: "🧟‍♂️", desc: "Survivre à l'enfer.", ranked: false },
    speed_run: { name: "Speed Run", icon: "⚡", desc: "Extraction Rapide.", ranked: false },
    team_battle: { name: "Team Battle", icon: "🛡️", desc: "4 vs 4 !", ranked: false },
    ctf: { name: "Capture Drapeau", icon: "🚩", desc: "Vole le drapeau !", ranked: false },
    payload: { name: "Convoi", icon: "🚃", desc: "Pousse le wagon !", ranked: false },
    royale: { name: "Battle Royale", icon: "🚁", desc: "Survivre à la zone !", ranked: false }
};

export const ARENAS = {
    tokyo: { name: "Neon Tokyo", color: '#050b14', grid: 'rgba(59,130,246,0.15)', wall: '#1e293b' },
    sand: { name: "Sandstorm", color: '#271a0c', grid: 'rgba(245,158,11,0.15)', wall: '#451a03' },
    ice: { name: "Ice Age", color: '#082f49', grid: 'rgba(255,255,255,0.1)', wall: '#164e63' },
    jungle: { name: "Jungle", color: '#064e3b', grid: 'rgba(34,197,94,0.2)', wall: '#052e16' },
    magma: { name: "Magma", color: '#450a0a', grid: 'rgba(239,68,68,0.2)', wall: '#280505' },
    ruins: { name: "Ruines", color: '#292524', grid: 'rgba(168,162,158,0.1)', wall: '#44403c' },
    cyber_city: { name: "Cyber City", color: '#0f172a', grid: 'rgba(6,182,212,0.2)', wall: '#164e63' },
    nebula: { name: "Nébuleuse", color: '#1e1b4b', grid: 'rgba(232, 121, 249, 0.2)', wall: '#312e81' },
    mainframe: { name: "Mainframe", color: '#022c22', grid: 'rgba(34, 211, 238, 0.3)', wall: '#134e4a', special: false },
    thunder_arena: { name: "Temple Foudre", color: '#422006', grid: 'rgba(234, 179, 8, 0.3)', wall: '#713f12', special: true },
    moon: { name: "Moon Base", color: '#1e293b', grid: 'rgba(148, 163, 184, 0.1)', wall: '#334155' },
    crystal: { name: "Cristal", color: '#2e1065', grid: 'rgba(167, 139, 250, 0.2)', wall: '#4c1d95', special: false },
    solaris: { name: "Solaris", color: '#451a03', grid: 'rgba(251, 146, 60, 0.2)', wall: '#7c2d12', special: false },
    swamp: { name: "Marais", color: '#222d1d', grid: 'rgba(132, 204, 22, 0.2)', wall: '#1a1f16' },
    factory: { name: "Usine", color: '#332e2b', grid: 'rgba(249, 115, 22, 0.2)', wall: '#292524' },
    void: { name: "Néant", color: '#000000', grid: 'rgba(255, 255, 255, 0.05)', wall: '#171717', special: false },
    atlantis: { name: "Atlantis", color: '#083344', grid: 'rgba(6, 182, 212, 0.2)', wall: '#155e75', special: false },
    dungeon: { name: "Donjon", color: '#1c1917', grid: 'rgba(120, 113, 108, 0.2)', wall: '#292524', special: false },
    reactor: { name: "Réacteur", color: '#1a202c', grid: 'rgba(132, 204, 22, 0.2)', wall: '#365314', special: false }
};

export const CLUBS = [
    { id: 'c1', name: "Elite Cyber", tag: "ELITE", members: 28, max: 30, trophies: 15400, desc: "Les meilleurs.", open: false, icon: "👑" },
    { id: 'c2', name: "Mathias Team", tag: "DEV", members: 5, max: 30, trophies: 0, desc: "Club officiel.", open: true, icon: "⚔️" },
    { id: 'c3', name: "Noob Slayers", tag: "KILL", members: 12, max: 30, trophies: 4500, desc: "Fun only.", open: true, icon: "💀" },
    { id: 'c4', name: "Golden Boys", tag: "GOLD", members: 29, max: 30, trophies: 25000, desc: "Rich ppl.", open: false, icon: "💎" },
    { id: 'c5', name: "Neon City", tag: "NEON", members: 18, max: 30, trophies: 8900, desc: "Cyberpunk Vibe.", open: true, icon: "🌆" }
];
