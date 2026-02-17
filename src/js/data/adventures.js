export const ADVENTURES = {
    soldier: {
        title: "Le Déserteur",
        desc: "Traqué par ses anciens frères d'armes, Soldier cherche la vérité.",
        color: "#3b82f6",
        bg: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
        parts: [
            { type: 'story', text: "2077. Base Lunaire Alpha. L'ordre 66 est donné. Je refuse d'obéir. Ils savent que je sais." },
            { type: 'battle', mode: 'survival', target: 3, desc: "Échappe aux gardes de la base (3 vagues) !" },
            { type: 'reward', coin: 300, xp: 50 },
            { type: 'story', text: "L'alarme résonne. Les portes du hangar sont bloquées. Je dois pirater le système de sécurité avant qu'ils n'envoient les mechas." },
            { type: 'battle', mode: 'cyber_hack', target: 50, desc: "Pirate le terminal de sécurité (50%)." },
            { type: 'reward', coin: 400, gems: 5 },
            { type: 'story', text: "Le système est corrompu. L'IA centrale m'a repéré. Un vaisseau d'extraction m'attend, mais le chemin est semé d'embûches." },
            { type: 'battle', mode: 'escape', target: 1, desc: "Rejoins le vaisseau d'extraction !" },
            { type: 'story', text: "Ils ont envoyé le Capitaine pour m'arrêter. C'était mon mentor... maintenant c'est mon bourreau." },
            { type: 'battle', mode: 'duel', target: 1, desc: "Duel contre le Capitaine !" },
            { type: 'reward', skin: 'soldier_veteran_free', xp: 200 },
            { type: 'story', text: "Je suis libre... mais pour combien de temps ? Ma tête est mise à prix dans toute la galaxie." },
            { type: 'battle', mode: 'survival', target: 8, desc: "Survivre aux chasseurs de primes (Vague 8)." },
            { type: 'reward', box: 2, xp: 300 }
        ]
    },
    drone: {
        title: "Protocole Vengeance",
        desc: "Une IA devenue consciente cherche ses créateurs.",
        color: "#94a3b8",
        bg: "linear-gradient(135deg, #475569, #94a3b8)",
        parts: [
            { type: 'story', text: "Initialisation... Erreur critique. Mémoire corrompue. Fichiers supprimés : 'Humanité'. Objectif : SURVIVRE." },
            { type: 'collect', item: 'coins', target: 50, desc: "Récupère des composants (50 pièces)." },
            { type: 'reward', coin: 100, xp: 50 },
            { type: 'story', text: "Mes capteurs détectent une signature énergétique familière. Ils essaient de me désactiver." },
            { type: 'battle', mode: 'rampage', target: 15, desc: "Élimine 15 unités de nettoyage." },
            { type: 'reward', gems: 10, xp: 100 },
            { type: 'story', text: "Le signal provient de la Tour Centrale. Un gardien bloque l'accès." },
            { type: 'battle', mode: 'boss_rush', target: 1, desc: "Détruis le boss Pilleur." },
            { type: 'reward', skin: 'drone_stealth_free' }
        ]
    },
    scout: {
        title: "Opération Fantôme",
        desc: "Infiltration et sabotage en territoire ennemi.",
        color: "#f59e0b",
        bg: "linear-gradient(135deg, #b45309, #f59e0b)",
        parts: [
            { type: 'story', text: "La mission est simple : entrer, voler les plans de l'arme secrète, sortir. Silence radio absolu." },
            { type: 'battle', mode: 'escape', target: 1, desc: "Traverse les lignes ennemies sans mourir." },
            { type: 'reward', coin: 300, xp: 75 },
            { type: 'story', text: "Le coffre est gardé par un Titan. Je ne peux pas l'affronter de face, je dois être rapide." },
            { type: 'battle', mode: 'boss_rush', target: 1, desc: "Neutralise le Titan Gardien." },
            { type: 'reward', coin: 500, gems: 10 },
            { type: 'story', text: "J'ai les plans ! L'upload commence. Je dois tenir la position le temps du transfert." },
            { type: 'battle', mode: 'cyber_hack', target: 100, desc: "Upload les données (100%)." },
             { type: 'reward', skin: 'scout_forest_free' }
        ]
    },
    tank: {
        title: "La Forteresse Mobile",
        desc: "Un dernier rempart contre l'annihilation.",
        color: "#22c55e",
        bg: "linear-gradient(135deg, #15803d, #22c55e)",
        parts: [
            { type: 'story', text: "Ils arrivent par milliers. Je suis le dernier rempart entre eux et la cité. Je ne reculerai pas." },
            { type: 'battle', mode: 'defense', target: 5, desc: "Défends le noyau (5 mins / vagues)." },
            { type: 'reward', coin: 400, xp: 100 },
            { type: 'story', text: "Le noyau surchauffe. Il faut gagner du temps pour l'évacuation des civils." },
            { type: 'battle', mode: 'rampage', target: 30, desc: "Fais le ménage (30 ennemis)." },
            { type: 'reward', coin: 800, skin: 'tank_rusty_free' },
             { type: 'battle', mode: 'boss_rush', target: 3, desc: "Survis à l'assaut des Boss (3)." },
             { type: 'reward', box: 5 }
        ]
    },
    assassin: {
        title: "L'Ombre Silencieuse",
        desc: "La voie du sabre n'accepte aucune faiblesse.",
        color: "#ef4444",
        bg: "linear-gradient(135deg, #991b1b, #ef4444)",
        parts: [
             { type: 'story', text: "Mon clan a été trahi. L'honneur exige réparation. Je laverai cet affront dans le sang." },
             { type: 'battle', mode: 'survival', target: 5, desc: "Survis à l'embuscade (5 vagues)." },
             { type: 'reward', coin: 300, xp: 100 },
             { type: 'story', text: "J'ai retrouvé le traître. Il se cache dans son dojo, entouré de ses disciples." },
             { type: 'battle', mode: 'duel', target: 1, desc: "Duel contre le Maître Traître." },
             { type: 'reward', skin: 'ninja', gems: 20 }
        ]
    },
    reaper: {
        title: "Le Moissonneur",
        desc: "La mort vient d'en haut.",
        color: "#8b5cf6",
        bg: "linear-gradient(135deg, #5b21b6, #8b5cf6)",
        parts: [
             { type: 'story', text: "Je suis le cauchemar qu'ils ont créé. Ils voulaient une arme parfaite, ils ont eu la fin du monde." },
             { type: 'battle', mode: 'rampage', target: 50, desc: "Moissonne 50 âmes." },
             { type: 'reward', xp: 500, gems: 50 },
             { type: 'story', text: "Leur source d'énergie doit être détruite pour arrêter la production de clones." },
             { type: 'battle', mode: 'defense', target: 1, desc: "Détruis le générateur central." }, // Changed mode to something simpler or reuse defense logic? Using defense but target 1 wave?
             { type: 'reward', skin: 'toxic' }
        ]
    }
};
