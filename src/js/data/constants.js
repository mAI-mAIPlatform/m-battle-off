export const CFG = { w: 0, h: 0, world: 2500 };

export const SPEED_FACTOR = 0.64;
export const RATE_FACTOR = 1.38;
export const RELOAD_FACTOR = 1.02;
export const PROJ_SPEED_FACTOR = 0.93;
export const ENEMY_HP_BUFF = 20;

export const RARITY = { common: { name: 'Commun', color: '#94a3b8', bg: 'bg-gray-500' }, rare: { name: 'Rare', color: '#3b82f6', bg: 'bg-blue-500' }, epic: { name: 'Épique', color: '#a855f7', bg: 'bg-purple-500' }, legendary: { name: 'Légendaire', color: '#eab308', bg: 'bg-yellow-500' }, mythic: { name: 'Mythique', color: '#ef4444', bg: 'bg-red-600' } };

export const PRICE_COMMON = 500;
export const PRICE_RARE = 1500;
export const PRICE_EPIC = 2500;
export const PRICE_LEGENDARY = 4000;
export const PRICE_MYTHIC = 6000;

export const CLUB_ICONS = ["🛡️","⚔️","👑","💀","🔥","❄️","⚡","🌟","🐉","🦁"];
export const MASTERY_MAX = 10;
export const MASTERY_XP = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000];

export const DIFFICULTY = {
    easy: { name: 'Facile', mult: 0.8, color: 'text-green-400' },
    normal: { name: 'Normal', mult: 1.0, color: 'text-blue-400' },
    hard: { name: 'Difficile', mult: 1.5, color: 'text-red-400' },
    expert: { name: 'Expert', mult: 2.0, color: 'text-purple-600' }
};

export const MODIFIERS = {
    normal: { name: 'Classique', color: 'text-gray-300' },
    oneshot: { name: 'One Shot', color: 'text-red-500' },
    poison: { name: 'Poison', color: 'text-green-500' },
    speed: { name: 'Speed', color: 'text-yellow-500' },
    vampire: { name: 'Vampire', color: 'text-pink-500' },
    infinite: { name: 'Infini', color: 'text-blue-400' },
    explosive: { name: 'Explosif', color: 'text-orange-500' },
    recoil: { name: 'Recul', color: 'text-white' },
    giant: { name: 'Géant', color: 'text-purple-600' },
    low_grav: { name: 'Gravity', color: 'text-indigo-400' },
    double_dmg: { name: 'Double Dégâts', color: 'text-red-600' },
    tiny: { name: 'Tiny', color: 'text-xs text-blue-300' },
    pluie: { name: 'Pluie Balles', color: 'text-cyan-400' },
    no_regen: { name: 'No Regen', color: 'text-gray-500' },
    fragile: { name: 'Fragile', color: 'text-red-300' },
    blind: { name: 'Aveugle', color: 'text-gray-500' },
    slow_mo: { name: 'Slow Mo', color: 'text-blue-300' },
    chaos: { name: 'Chaos', color: 'text-purple-500' }
};

export const CURRENT_VERSION_KEY = 'mBattle_Data_v1_5_4';
export const PREVIOUS_KEYS = ['mBattle_Data_v1_5_0', 'mBattle_Data_v1_4_8', 'mBattle_Data_v1_4_4', 'mBattle_Data_v1_4_3', 'mBattle_Data_v1_4_2', 'mBattle_Data_v1_4_1', 'mBattle_Data_v1_4_0', 'mBattle_Data_v1_3_5', 'mBattle_Data_v1_3', 'mBattle_Data_v1_2_9', 'mBattle_Data_v1_2_8', 'mBattle_Data_v1_2_7', 'mBattle_Data_v1_2_5', 'mBattle_Data_v1_2_4', 'mBattle_Data_v1_2_1', 'mBattle_Data_v1_1_5', 'mBattle_Data_v1_1_4', 'mBattle_Data_v1_1_3', 'mBattle_Data_v1_1_2', 'mBattle_Data_v1_1_0', 'mBattle_Data_v1_0_6', 'mBattle_Data_v1_0', 'mBattle_Data_v1_0_5', 'mBattle_Data_v20', 'mBattle_Data_v19', 'mBattle_Data_v18', 'mBattle_Data_v17', 'mBattle_Data_v16'];

export const PASS_REWARDS = {
    1: { free: 'coins:100', pro: 'mega_caisse_loot:1', max: 'gems:50' },
    5: { free: 'emote:hacker', pro: 'gems:50', max: 'box:3' },
    10: { free: 'box:1', pro: 'mega_caisse_loot:1', max: 'gems:100' },
    15: { free: 'coins:200', pro: 'emote:alien', max: 'coins:2000' },
    20: { free: 'box:1', pro: 'gems:100', max: 'mega_caisse_loot:1' },
    30: { free: 'box:1', pro: 'emote:mindblown', max: 'gems:150' },
    40: { free: 'coins:500', pro: 'coins:1000', max: 'mega_caisse_loot:2' },
    50: { free: 'box:1', pro: 'gems:300', max: 'gems:400' },
    60: { free: 'coins:1000', pro: 'coins:2000', max: 'mega_caisse_loot:3' },
    70: { free: 'box:2', pro: 'gems:150', max: 'gems:250' },
    80: { free: 'coins:2000', pro: 'coins:4000', max: 'mega_caisse_loot:4' },
    90: { free: 'box:3', pro: 'emote:moai', max: 'gems:500' },
    100: { free: 'mega_caisse_loot:1', pro: 'gems:500', max: 'mega_caisse_loot:10' }
};

export const RANKS = [
    {n:"BRONZE I", t:0, c:"#cd7f32"}, {n:"BRONZE II", t:100, c:"#cd7f32"}, {n:"BRONZE III", t:200, c:"#cd7f32"},
    {n:"SILVER I", t:300, c:"#c0c0c0"}, {n:"SILVER II", t:500, c:"#c0c0c0"}, {n:"SILVER III", t:700, c:"#c0c0c0"},
    {n:"GOLD I", t:1000, c:"#ffd700"}, {n:"GOLD II", t:1300, c:"#ffd700"}, {n:"GOLD III", t:1600, c:"#ffd700"},
    {n:"PLATINUM I", t:2000, c:"#22d3ee"}, {n:"PLATINUM II", t:2500, c:"#22d3ee"}, {n:"DIAMOND", t:3500, c:"#a855f7"},
    {n:"mMASTER", t:5000, c:"#ef4444"},
    {n:"GRANDMASTER", t:7500, c:"#b91c1c"}, {n:"CHALLENGER", t:10000, c:"#f59e0b"}, {n:"LEGEND", t:15000, c:"#7c3aed"},
    {n:"GOD", t:25000, c:"#facc15"}, {n:"ETERNAL", t:50000, c:"#ffffff"}
];

export const ICONS = ["👤","🤖","👽","🦁","🦄","💀","⚔️","💎","👑","🎮","🚀","🔥","❄️","⚡","🌟","🐱","🐶","🦊","🐸","🐵","🐼","🐨","🐯","🐙","🦖","👻","💩","🤡","👹","👺","🎃","🦾","🧠","👀","💥","💯","🥶","🥵","🤠","🥸","🤑", "🥷", "🧙", "🧪", "🦠", "🧬", "💾", "⚙️", "💡", "📡", "🛸", "👾", "🐉", "🐺", "🦉", "🦋", "🍄", "🌷", "🌲", "🌊", "🌋", "🏖️", "🌃", "🏙️", "🏛️", "🧱", "🏮", "⛩️", "🏯", "🗼", "🗽", "🔔", "🎶", "🎤", "🎸", "🎧", "🕹️", "🎯", "🎲", "🎱", "🏀", "⚽", "🏈", "⚾", "🎾", "🥊", "🥋", "🥇", "🥈", "🥉", "🎉", "🎈", "🎁", "🧧", "🎀", "📦", "✉️", "🔑", "🗝️", "🔨", "🛠️", "🪓", "🔫", "🏹", "🛡️", "⚰️", "⚱️", "👑", "🔮", "🪄", "🔑", "🛡️", "🔥", "💧", "🌍", "✨", "💫", "🌑", "☀️", "🌙", "⭐", "🌈", "☄️", "💥", "⚡", "🌩️", "☔", "🌪️", "💨", "🍂", "🍁", "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🍍", "🥥", "🥝", "🥭", "🍅", "🍆", "🌶️", "🌽", "🥕", "🥔", "🍠", "🥐", "🍞", "🥖", "🥨", "🥞", "🧇", "🧀", "🥚", "🍳", "🥓", "🥩", "🍗", "🍖", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🥙", "🧆", "🥗", "🥘", "🍲", "🍝", "🍜", "🍣", "🍤", "🍥", "🍡", "🥠", "🥡", "🍚", "🍛", "🍗", "🍣", "🍤", "🍥", "🍡", "🥠", "🥡", "🍚", "🍛"];

export const EMOTE_LIST = [
    {id:'happy', i:'😀', price: 0}, {id:'angry', i:'😡', price: 0}, {id:'gg', i:'👍', price: 0}, {id:'rip', i:'💀', price: 0},
    {id:'love', i:'😍', price: 15}, {id:'clown', i:'🤡', price: 15}, {id:'fire', i:'🔥', price: 25}, {id:'crown', i:'👑', price: 45},
    {id:'ghost', i:'👻', price: 25}, {id:'robot', i:'🤖', price: 25}, {id:'flex', i:'💪', price: 15}, {id:'cry', i:'😭', price: 15},
    {id:'cool', i:'😎', price: 15}, {id:'party', i:'🥳', price: 15}, {id:'sleeping', i:'😴', price: 5}, {id:'devil', i:'😈', price: 25},
    {id:'money', i:'🤑', price: 35}, {id:'sick', i:'🤢', price: 5}, {id:'shhh', i:'🤫', price: 10}, {id:'think', i:'🤔', price: 10},
    {id:'dab', i:'🙅', price: 95}, {id:'rich', i:'💸', price: 195}, {id:'hacker', i:'💻', price: 145}, {id:'cat', i:'🙀', price: 115},
    {id:'alien', i:'👽', price: 20}, {id:'nerd', i:'🤓', price: 10}, {id:'rage', i:'🤬', price: 30}, {id:'mindblown', i:'🤯', price: 25},
    {id:'scream', i:'😱', price: 15}, {id:'star', i:'🤩', price: 20}, {id:'cowboy', i:'🤠', price: 25}, {id:'mask', i:'😷', price: 5},
    {id:'ice', i:'🥶', price: 25}, {id:'boxe', i:'🥊', price: 30}, {id:'zen', i:'🧘', price: 10}, {id:'dice', i:'🎲', price: 15},
    // NEW 1.1.2
    {id:'zipper', i:'🤐', price: 10}, {id:'melting', i:'🫠', price: 20}, {id:'salute', i:'🫡', price: 25}, {id:'peeking', i:'🫣', price: 20},
    {id:'diagonal', i:'😵‍💫', price: 25}, {id:'ninja', i:'🥷', price: 80}, {id:'king', i:'🤴', price: 50}, {id:'zombie', i:'🧟', price: 30},
    {id:'brain', i:'🧠', price: 40}, {id:'rockon', i:'🤘', price: 20}, {id:'poop', i:'💩', price: 5}, {id:'chicken', i:'🐔', price: 35},
    {id:'dragon', i:'🐲', price: 100}, {id:'unicorn', i:'🦄', price: 90}, {id:'ufo', i:'🛸', price: 60},
    // NEW 1.1.5
    {id:'hamburger', i:'🍔', price: 20}, {id:'pizza', i:'🍕', price: 20}, {id:'fries', i:'🍟', price: 15}, {id:'hotdog', i:'🌭', price: 15},
    {id:'popcorn', i:'🍿', price: 10}, {id:'donut', i:'🍩', price: 15}, {id:'cookie', i:'🍪', price: 10}, {id:'beer', i:'🍺', price: 30},
    {id:'cheers', i:'🍻', price: 40}, {id:'wine', i:'🍷', price: 35}, {id:'cocktail', i:'🍹', price: 35}, {id:'tropical', i:'🏝️', price: 50},
    {id:'sun', i:'☀️', price: 10}, {id:'cloud', i:'☁️', price: 5}, {id:'rain', i:'🌧️', price: 15}, {id:'snow', i:'❄️', price: 20},
    {id:'umbrella', i:'☂️', price: 15}, {id:'rainbow', i:'🌈', price: 40}, {id:'soccer', i:'⚽', price: 25}, {id:'basketball', i:'🏀', price: 25},
    {id:'tennis', i:'🎾', price: 25}, {id:'baseball', i:'⚾', price: 25}, {id:'trophy', i:'🏆', price: 100}, {id:'medal', i:'🥇', price: 50},
    {id:'gamer', i:'🎮', price: 30}, {id:'music', i:'🎵', price: 15},
    // NEW 1.2.0 - 100 EMOTES UPDATE
    {id:'mouse', i:'🐭', price: 10}, {id:'hamster', i:'🐹', price: 10}, {id:'rabbit', i:'🐰', price: 15}, {id:'fox', i:'🦊', price: 20},
    {id:'bear', i:'🐻', price: 20}, {id:'panda', i:'🐼', price: 25}, {id:'koala', i:'🐨', price: 25}, {id:'tiger', i:'🐯', price: 30},
    {id:'lion', i:'🦁', price: 30}, {id:'cow', i:'🐮', price: 15}, {id:'pig', i:'🐷', price: 15}, {id:'frog', i:'🐸', price: 10},
    {id:'monkey', i:'🐵', price: 20}, {id:'penguin', i:'🐧', price: 30}, {id:'bird', i:'🐦', price: 10}, {id:'chick', i:'🐥', price: 10},
    {id:'duck', i:'🦆', price: 15}, {id:'eagle', i:'🦅', price: 40}, {id:'owl', i:'🦉', price: 30}, {id:'bat', i:'🦇', price: 20},
    {id:'wolf', i:'🐺', price: 35}, {id:'boar', i:'🐗', price: 25}, {id:'horse', i:'🐴', price: 20}, {id:'bomb', i:'💣', price: 25},
    {id:'dagger', i:'🗡️', price: 35}, {id:'shield', i:'🛡️', price: 20}, {id:'potion', i:'🧪', price: 15}, {id:'map', i:'🗺️', price: 10},
    {id:'compass', i:'🧭', price: 15}, {id:'anchor', i:'⚓', price: 20}, {id:'rocket', i:'🚀', price: 50}, {id:'ship', i:'🚢', price: 40},
    {id:'car', i:'🚗', price: 20}, {id:'bus', i:'🚌', price: 20}, {id:'police', i:'🚓', price: 25}, {id:'taxi', i:'🚕', price: 20},
    {id:'bicycle', i:'🚲', price: 10}, {id:'broken', i:'💔', price: 5}, {id:'heartfire', i:'❤️‍🔥', price: 30}, {id:'sparkle', i:'✨', price: 25},
    {id:'cyclone', i:'🌀', price: 35}, {id:'fog', i:'🌫️', price: 10}, {id:'zap', i:'⚡', price: 20}, {id:'extinguisher', i:'🧯', price: 15},
    {id:'moai', i:'🗿', price: 50}, {id:'peach', i:'🍑', price: 10}, {id:'eggplant', i:'🍆', price: 10}, {id:'cherries', i:'🍒', price: 10}
];
// Sort emotes by price
EMOTE_LIST.sort((a, b) => a.price - b.price);

export const PERKS = [
    { name: "Puissance", icon: "💪", desc: "Dégâts +10%", fn: (p) => { p.stats.dmg *= 1.1; window.ui.notif("DÉGÂTS UP!", "#ef4444"); } },
    { name: "Vitalité", icon: "❤️", desc: "Santé +20%", fn: (p) => { const add = p.maxHp * 0.2; p.maxHp += add; p.hp += add; window.ui.notif("SANTÉ UP!", "#22c55e"); } },
    { name: "Agilité", icon: "⚡", desc: "Vitesse +10%", fn: (p) => { p.stats.spd *= 1.1; window.ui.notif("VITESSE UP!", "#facc15"); } },
    { name: "Recharge", icon: "🔄", desc: "Recharge -10%", fn: (p) => { p.stats.reload *= 0.9; window.ui.notif("RECHARGE UP!", "#3b82f6"); } },
    { name: "Furie", icon: "🔫", desc: "Cadence +10%", fn: (p) => { p.stats.rate *= 0.9; window.ui.notif("CADENCE UP!", "#f97316"); } },
    { name: "Chargeur", icon: "📦", desc: "Munitions +1", fn: (p) => { p.ammoMax += 1; p.ammo += 1; window.ui.notif("MUNITIONS UP!", "#a855f7"); } }
];
